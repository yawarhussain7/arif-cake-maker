
import OrderModel from "../models/order.model.js";
import Cake from "../models/cakes.model.js";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import { notifyAdmins, createNotification } from "../services/notification.service.js";

const deliveryCharge = () => {
    const charge = Number(process.env.DELIVERY_CHARGE ?? 300);

    if (!Number.isFinite(charge) || charge < 0) {
        throw new Error("Invalid delivery charge");
    }

    return charge;
};

const createOrder = async ({
    customerId = null,
    customerName = "",
    customerEmail = "",
    items,
    deliveryAddress,
    city,
    phone,
    deliveryDate = null,
    specialInstructions = "",
    paymentMethod = "Cash on Delivery",
}) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Order must contain at least one item", 400);
    }

    // Karachi-only delivery enforcement.
    if (!city || city.trim().toLowerCase() !== "karachi") {
        throw new AppError("We currently only deliver within Karachi.", 400);
    }
    if (!deliveryAddress || !/karachi/i.test(deliveryAddress)) {
        throw new AppError("Delivery address must be within Karachi, Pakistan.", 400);
    }

    const delivery_charge = deliveryCharge();

    const byCake = new Map();
    const customItems = []; // off-catalogue items quoted without a cake id

    for (const item of items) {
        if (item.cake) {
            const cakeId = item.cake.toString();
            byCake.set(cakeId, (byCake.get(cakeId) || 0) + item.quantity);
        } else {
            customItems.push(item);
        }
    }

    const orderItems = [];
    let subtotal = 0;

    for (const [cakeId, quantity] of byCake) {
        if (!mongoose.isValidObjectId(cakeId)) {
            throw new AppError(`Invalid cake id: ${cakeId}`, 400);
        }

        const cake = await Cake.findById(cakeId);

        if (!cake) {
            throw new AppError(`Cake not found: ${cakeId}`, 404);
        }

        if (cake.isAvailable === false) {
            throw new AppError(`"${cake.name}" is unavailable`, 409);
        }

        // Always use the price stored in the database
        orderItems.push({
            cake: cake._id,
            name: cake.name,
            price: cake.price,
            quantity,
        });

        subtotal += cake.price * quantity;
    }

    // Off-catalogue / custom items keep the quoted price.
    for (const item of customItems) {
        orderItems.push({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        });

        subtotal += item.price * item.quantity;
    }

    subtotal = Number(subtotal.toFixed(2));
    const totalAmount = Number((subtotal + delivery_charge).toFixed(2));

    // No stock was reserved, so a failed save needs no compensation.
    const order = await OrderModel.create({
        customer: customerId || undefined,
        customerName,
        customerEmail,
        items: orderItems,
        subtotal,
        deliveryCharge: delivery_charge,
        totalAmount,
        deliveryAddress: deliveryAddress.trim(),
        phone: phone.trim(),
        deliveryDate,
        specialInstructions,
        paymentMethod,
        paymentStatus: "Pending",
        status: "Pending",
    });

    const first = orderItems[0];
    await notifyAdmins({
        title: `New order ${order.orderNumber}`,
        message: `${order.customerName || "A customer"} ordered ${first.quantity} x ${first.name} (total ${order.totalAmount})`,
        type: "order",
        metadata: {
            orderId: String(order._id),
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
        },
    });

    // Best-effort: confirm the order back to a signed-in customer, who will
    // see it in the storefront bell. Guests have no account to notify.
    if (order.customer) {
        await createNotification(order.customer, {
            title: `Order ${order.orderNumber} received`,
            message: `Thanks! We're preparing ${first.quantity} x ${first.name}.`,
            type: "order",
            metadata: {
                orderId: String(order._id),
                orderNumber: order.orderNumber,
                status: order.status,
            },
        });
    }

    return order;
};

// Get all orders belonging to the logged-in customer
const getMyOrders = async (customerId) => {
    return OrderModel.find({ customer: customerId })
        .populate("customer", "username email")
        .populate("items.cake", "name photo category")
        .sort({ createdAt: -1 });
};

// Get one order belonging to the logged-in customer
const getMyOrderById = async (orderId, customerId) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await OrderModel.findOne({
        _id: orderId,
        customer: customerId,
    })
        .populate("customer", "username email")
        .populate("items.cake", "name photo category");

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return order;
};

// Get all orders (admin)
const getAllOrders = async () => {
    return OrderModel.find()
        .populate("customer", "username email")
        .populate("items.cake", "name photo category")
        .sort({ createdAt: -1 });
};

// Get one order (admin)
const getOrderById = async (orderId) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await OrderModel.findById(orderId)
        .populate("customer", "username email")
        .populate("items.cake", "name photo category");

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    return order;
};

const updateOrderStatus = async (orderId, status) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const validTransitions = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Preparing", "Cancelled"],
        Preparing: ["Out for Delivery", "Cancelled"],
        "Out for Delivery": ["Delivered"],
        Delivered: [],
        Cancelled: [],
    };

    if (status === "Cancelled") {
        return cancelOrder(orderId);
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (!validTransitions[order.status]?.includes(status)) {
        throw new AppError(
            `Cannot change status from "${order.status}" to "${status}"`,
            400
        );
    }

    order.status = status;
    await order.save();


    if (order.customer) {
        await createNotification(order.customer, {
            title: `Order ${order.orderNumber} is ${status.toLowerCase()}`,
            message: status === "Delivered"
                ? `Your order has been delivered. Enjoy!`
                : `Your order has moved to ${status}.`,
            type: "order",
            metadata: {
                orderId: String(order._id),
                orderNumber: order.orderNumber,
                status,
            },
        });
    }

    return order;
};

const cancelOrder = async (orderId, customerId = null) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const filter = { _id: orderId };

    // If customerId is supplied, only that customer's order is matched
    if (customerId) {
        filter.customer = customerId;
    }

    const order = await OrderModel.findOne(filter);

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    if (["Cancelled", "Delivered", "Out for Delivery"].includes(order.status)) {
        throw new AppError(
            `Cannot cancel an order with status "${order.status}"`,
            400
        );
    }

    order.status = "Cancelled";
    await order.save();

    // Best-effort: let a signed-in customer know their order was cancelled.
    if (order.customer) {
        await createNotification(order.customer, {
            title: `Order ${order.orderNumber} cancelled`,
            message: "Your order was cancelled. Get in touch if this wasn't you.",
            type: "warning",
            metadata: {
                orderId: String(order._id),
                orderNumber: order.orderNumber,
                status: "Cancelled",
            },
        });
    }

    return order;
};

const getTotalOrder = async () => {
    return await OrderModel.countDocuments;
}
 const deleteOrder = async (orderId) => {
    if (!mongoose.isValidObjectId(orderId)) {
        throw new AppError("Invalid order ID", 400);
    }

    const order = await OrderModel.findByIdAndDelete(orderId)
    if (!order) {
        throw new AppError("Order not found", 404);
    }
    return order
}
export {
    createOrder,
    getMyOrders,
    getMyOrderById,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getTotalOrder,
    deleteOrder
};

