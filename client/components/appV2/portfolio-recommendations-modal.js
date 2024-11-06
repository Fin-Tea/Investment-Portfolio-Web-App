import React, { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react';


  export default function PortfolioRecommendationsModal({ isOpen, onClose, onSubmit, children }) {


    return (<Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Portfolio Recommendations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {children}
          </ModalBody>

          <ModalFooter>
            <button className="rounded-md border p-2 px-4 mr-4"  onClick={onClose}> Close</button>
            <button className="rounded-md bg-purple-800 text-white p-2 px-4" onClick={() => { onSubmit && onSubmit()}}>Ok</button>
          </ModalFooter>
        </ModalContent>
      </Modal>)

  }