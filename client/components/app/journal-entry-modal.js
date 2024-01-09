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
import Select from "react-select";


  export default function JournalEntryModal({ isOpen, onClose, tags, onSubmit}) {
    const [selectedTag, setSelectedTag] = useState(null);


    return (<Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Journal Entry</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p className="font-bold">Tag</p>
            <Select placeholder="Select tag..." options={tags} onChange={(tag) => setSelectedTag(tag)} />
          </ModalBody>

          <ModalFooter>
            <button className="rounded-md border p-2 px-4 mr-4"  onClick={onClose}> Close</button>
            <button className="rounded-md bg-purple-800 text-white p-2 px-4" onClick={() => { if (selectedTag && onSubmit) { onSubmit(selectedTag); setSelectedTag(null);}}}>Create</button>
          </ModalFooter>
        </ModalContent>
      </Modal>)

  }