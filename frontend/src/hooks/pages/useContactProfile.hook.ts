import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { ContactService } from "@/services/contact.service";
import { handleAxiosError } from "@/utils/handleAxiosError.util";
import profileImagePlaceholder from '@/assets/img/profile_image_placeholder.png';
import type { ContactRelationStatus } from "@shared/maps/filters/contacts/contactRelationStatus.filter";
import type { ContactDetailsResponse as ContactDetails } from "@shared/dtos/contact.dto";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Modals = 
| 'PROFILE_IMAGE_EXPAND'
| 'CONFIRM_CANCEL_CONTACT_REQUEST'
| 'CONFIRM_DENY_CONTACT_REQUEST'
| 'CONFIRM_ACCEPT_CONTACT_REQUEST'
| 'CONFIRM_UNDO_CONTACT'
;

export const useContactProfile = () => {

  const navigate = useNavigate();

  const { showToast } = useToast();
  const { user } = useAuth();

  const { id } = useParams();

  const [contact, setContact] = useState<ContactDetails | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAcceptingContactRequest, setIsAcceptingContactRequest] = useState<boolean>(false);
  const [isDenyingContactRequest, setIsDenyingContactRequest] = useState<boolean>(false);
  const [isUndoingContactRequest, setIsUndoingContactRequest] = useState<boolean>(false);
  const [isCancellingContactRequest, setIsCancellingContactRequest] = useState<boolean>(false);
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);

  const [modal, setModal] = useState<Modals | null>(null);

  useEffect(() => {

    const getContactDetails = async (): Promise<void> => {
      try {
        if (!id || !Number.isSafeInteger(Number(id))) {
          throw new Error("Invalid contact ID");
        }

        setLoading(true);
        setError(null);
        setContact(null);

        const response = await ContactService.getContactDetails(Number(id));

        setContact(response);
      } catch (error: unknown) {
        setError(handleAxiosError(error));
      } finally {
        setLoading(false);
      }
    };

    getContactDetails();
  }, [id]);



  const handleSetNewContactRelationStatus = (
    relation : ContactRelationStatus,
    message  : string,
  ): void => {

    setContact(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        loggedUserContactStatus: relation,
      };
    });

    showToast("INFO", message);
  };



  const handleAddContactToList = (
    newContact : ContactDetails["contacts"][number]
  ): void => {

    setContact(prev => {
      if (!prev) return prev;

      if (prev.contacts.some(contact => contact.id === newContact.id)) {
        return prev;
      }

      return {
        ...prev,
        totalContacts: prev.totalContacts + 1,
        contacts: [
          ...prev.contacts,
          newContact,
        ],
      };
    });
  };



  const handleRemoveContactFromList = (
    contactId: number
  ): void => {

    setContact(prev => {
      if (!prev) return prev;

      const contacts = prev.contacts.filter(
        contact => contact.id !== contactId
      );

      if (contacts.length === prev.contacts.length) {
        return prev;
      }

      return {
        ...prev,
        totalContacts: Math.max(0, prev.totalContacts - 1),
        contacts,
      };
    });
  };



  const handleAddContact = async (
    contactId: number
  ): Promise<void> => {

    try {
      if (isAddingContact) return;

      setIsAddingContact(true);

      const response = await ContactService.addContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to send contact request");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );

    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsAddingContact(false);
    }
  };


  
  const handleAcceptContactRequest = async (
    contactId : number
  ): Promise<void> => {
    try {
      if (isAcceptingContactRequest) return;
      setIsAcceptingContactRequest(true);

      const response = await ContactService.acceptContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to accept contact request");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );

      if (!user) return;

      handleAddContactToList({
        id              : user.id,
        profileImageURL : user.profileImageURL,
        username        : user.name,
      });

    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsAcceptingContactRequest(false);
      setModal(null);
    }
  };



  const handleDenyContactRequest = async (
    contactId: number
  ): Promise<void> => {

    try {
      if (isDenyingContactRequest) return;

      setIsDenyingContactRequest(true);

      const response = await ContactService.denyContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to deny contact request");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );

    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setModal(null);
      setIsDenyingContactRequest(false);
    }
  };



  const handleUndoContactRequest = async (
    contactId: number
  ): Promise<void> => {

    try {
      if (isUndoingContactRequest) return;

      setIsUndoingContactRequest(true);

      const response = await ContactService.undoContactRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to undo contact");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );

      if (!user) return;

      handleRemoveContactFromList(user.id);

    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsUndoingContactRequest(false);
      setModal(null);
    }
  };



  const handleCancelContactRequest = async (
    contactId : number
  ): Promise<void> => {
    try {
      if (isCancellingContactRequest) return;
      setIsCancellingContactRequest(true);

      const response = await ContactService.cancelContactPendingRequest(contactId);

      if (!response.success) {
        throw new Error("Unable to cancel contact request");
      }

      handleSetNewContactRelationStatus(
        response.body.requestStatus,
        response.message,
      );

    } catch (error: unknown) {
      showToast("ERROR", handleAxiosError(error));
    } finally {
      setIsCancellingContactRequest(false);
      setModal(null);
    }
  };



  return {
    user: user,

    misc: {
      profileImagePlaceholder,
    },

    hooks: {
      navigate,
      showToast,
      user,
      id,
    },

    states: {
      contact,
      loading,
      error,

      isAcceptingContactRequest,
      isDenyingContactRequest,
      isUndoingContactRequest,
      isCancellingContactRequest,
      isAddingContact,

      modal,
    },

    setters: {
      setContact,
      setModal,
    },

    handlers: {
      handleSetNewContactRelationStatus,
      handleAddContactToList,
      handleRemoveContactFromList,

      handleAddContact,
      handleAcceptContactRequest,
      handleDenyContactRequest,
      handleUndoContactRequest,
      handleCancelContactRequest,
    },
  };
};
