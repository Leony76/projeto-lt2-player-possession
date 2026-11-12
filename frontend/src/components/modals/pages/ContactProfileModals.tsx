import ImageExpand from '@/components/ImageExpand';
import type { useContactProfile } from '@/hooks/pages/useContactProfile.hook';
import React from 'react'
import ConfirmationModal from '../ConfirmationModal';

type Props = {
  contactProfile : ReturnType<typeof useContactProfile>;
}

const ContactProfileModals = ({ contactProfile }: Props): React.JSX.Element | null => {

  const { handlers, states, setters, hooks, misc } = contactProfile;

  return (
    <>
      {states.modal === 'PROFILE_IMAGE_EXPAND' && (
        <ImageExpand
          imageURL={states.contact?.profileImageURL ?? misc.profileImagePlaceholder}
          label={states.contact?.name ?? 'unknown'}
          onClick={() => setters.setModal(null)}
        />
      )}



      {states.modal === 'CONFIRM_ACCEPT_CONTACT_REQUEST' && (
        <ConfirmationModal
          loading={states.isAcceptingContactRequest}
          message={`Are you sure you want to accept the contact request from ${states.contact?.name}?`}
          onCancel={() => setters.setModal(null)}
          onConfirm={() => states.contact?.id 
            ? handlers.handleAcceptContactRequest(states.contact?.id!) 
            : hooks.showToast('ERROR', 'Unable to procced the operation')
          }
        />
      )}



      {states.modal === 'CONFIRM_DENY_CONTACT_REQUEST' && (
        <ConfirmationModal
          loading={states.isDenyingContactRequest}
          message={`Are you sure you want to deny the contact request from ${states.contact?.name}?`}
          onCancel={() => setters.setModal(null)}
          onConfirm={() => states.contact?.id 
            ? handlers.handleDenyContactRequest(states.contact?.id!) 
            : hooks.showToast('ERROR', 'Unable to procced the operation')
          }
        />
      )}



      {states.modal === 'CONFIRM_CANCEL_CONTACT_REQUEST' && (
        <ConfirmationModal
          loading={states.isCancellingContactRequest}
          message={`Are you sure you want to cancel your contact request to ${states.contact?.name}?`}
          onCancel={() => setters.setModal(null)}
          onConfirm={() => states.contact?.id 
            ? handlers.handleCancelContactRequest(states.contact?.id!) 
            : hooks.showToast('ERROR', 'Unable to procced the operation')
          }
        />
      )}



      {states.modal === 'CONFIRM_UNDO_CONTACT' && (
        <ConfirmationModal
          loading={states.isUndoingContactRequest}
          message={`Are you sure you want to undo your contact to ${states.contact?.name}?`}
          onCancel={() => setters.setModal(null)}
          onConfirm={() => states.contact?.id 
            ? handlers.handleUndoContactRequest(states.contact?.id!) 
            : hooks.showToast('ERROR', 'Unable to procced the operation')
          }
        />
      )}
    </>
  )
}

export default ContactProfileModals