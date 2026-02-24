
import { toast } from "react-toastify";
import "./Popup.css"
const InvitationPopup = ({ message, onConfirm, onCancel }) => {
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message)
      .then(() => {
        toast.info('Invitation copied to clipboard')
        console.log('Invitation copied to clipboard');
        // Optionally, you can add a success message or any other action here
      })
      .catch((error) => {
        toast.error("Failed to copy invitation to clipboard")
        console.error('Failed to copy invitation to clipboard:', error);
        // Optionally, you can handle errors here
      });
      onConfirm();
  };
    return (
      <div className="popup-container">
        <div className="popup popup1">
          <textarea className="text-style">{message}</textarea>
          <div className="popup-buttons">
            <button onClick={onCancel}>Cancel</button>
            <button data-dismiss="modal"
                         aria-label="Close"
                         onClick={copyToClipboard}>Copy Invitation</button>
          </div>
        </div>
      </div>
    );
  };
  
  export default InvitationPopup;