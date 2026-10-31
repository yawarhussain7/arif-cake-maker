import {
    createOrder,
    getMyOrders,
    getMyOrderById,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
} from "../services/order.service.js";
import { sendresponse } from "../utils/response.js";
import AppError from "../utils/AppError.js";


export const createNewOrderController = async (req, res, next) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return sendresponse(req, res, 400, false, "request is empty");
        }

        const order = await createOrder({
            customerId: req.user?.id ?? null,
            customerName: req.body.customerName ?? req.user?.username ?? "",
            customerEmail: req.body.customerEmail ?? req.user?.email ?? "",
            items: req.body.items,
            deliveryAddress: req.body.deliveryAddress,
            city: req.body.city,
            phone: req.body.phone,
            deliveryDate: req.body.deliveryDate ?? null,
            specialInstructions: req.body.specialInstructions,
            paymentMethod: req.body.paymentMethod,
        });

        return sendresponse(req, res, 201, true, "Order created successfully", order);
    } catch (error) {
        next(error);
    }
};

export const getMyOrdersController = async (req, res, next) => {
    try {
        const orders = await getMyOrders(req.user.id);
        return sendresponse(req, res, 200, true, "Orders fetched successfully", orders);
    } catch (error) {
        next(error);
    }
};

export const getMyOrderController = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await getMyOrderById(orderId, req.user.id);
        return sendresponse(req, res, 200, true, "Order fetched successfully", order);
    } catch (error) {
        next(error);
    }
};

// GET /orders — all orders (admin)
export const getAllOrderController = async (req, res, next) => {
    try {
        const orders = await getAllOrders();
        return sendresponse(req, res, 200, true, "Orders fetched successfully", orders);
    } catch (error) {
        next(error);
    }
};

// GET /orders/:orderId — one order (admin)
export const getOrderByIdController = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await getOrderById(orderId);
        return sendresponse(req, res, 200, true, "Order fetched successfully", order);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatusController = async (req, res, next) => {
    try {
        const status = req.body?.status;
        const allowed = [
            "Pending",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
        ];
        if (!allowed.includes(status)) {
            throw new AppError(`Invalid status: ${status}`, 400);
        }

        const order = await updateOrderStatus(req.params.orderId, status);

        return sendresponse(req, res, 200, true, "Order status updated successfully", order);
    } catch (error) {
        next(error);
    }
};

// PATCH /orders/:orderId/cancel — cancel an order (customer, own orders only)
export const cancelMyOrderController = async (req, res, next) => {
    try {
        const order = await cancelOrder(req.params.orderId, req.user.id);
        return sendresponse(req, res, 200, true, "Order cancelled successfully", order);
    } catch (error) {
        next(error);
    }
};

export const deleteOrderController = async (req, res, next) => {
    try {
        const order = await deleteOrder(req.params.orderId);
        return sendresponse(req, res, 200, true, "Order deleted successfully", order);
    } catch (error) {
        next(error);
    }
};

// DELETE /orders/:orderId/cancel — cancel any order (admin)
export const adminCancelOrderController = async (req, res, next) => {
    try {
        const order = await cancelOrder(req.params.orderId);
        return sendresponse(req, res, 200, true, "Order cancelled successfully", order);
    } catch (error) {
        next(error);
    }
};
