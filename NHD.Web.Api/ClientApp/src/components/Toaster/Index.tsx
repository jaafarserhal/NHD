import React from "react";
import { createPortal } from "react-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Create a portal container div if it doesn't exist
const portalRoot = document.getElementById("toast-portal") || (() => {
    const div = document.createElement("div");
    div.id = "toast-portal";
    document.body.appendChild(div);
    return div;
})();

export const PortalToastContainer = () => {
    return createPortal(
        <ToastContainer
            newestOnTop={true}
            style={{ zIndex: 999999 }} // topmost z-index
            limit={5}
            transition={Bounce}
        />,
        portalRoot
    );
};
