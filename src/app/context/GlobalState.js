import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [additionalDetails, setAdditionalDetails] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedOrderConfirm, setSelectedOrderConfirm] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <GlobalStateContext.Provider
      value={{
        additionalDetails,
        setAdditionalDetails,
        selectedFarmer,
        setSelectedFarmer,
        selectedProduct,
        setSelectedProduct,
        selectedImageUri,
        setSelectedImageUri,
        selectedOrder,
        setSelectedOrder,
        selectedVideo,
        setSelectedVideo,
        selectedOrderConfirm,
        setSelectedOrderConfirm,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  return useContext(GlobalStateContext);
};

export default GlobalStateProvider;
