import React from "react";

const OrderModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Order Details</h2>
        <p>Here you can add your order details.</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default OrderModal;
