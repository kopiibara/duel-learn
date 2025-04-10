import * as React from "react";
import ActionButtons from "./ActionButtons";
import defaultPicture from "../../assets/profile-picture/default-picture.svg";

interface NotificationCardProps {
  type?: "pending" | "accepted" | "declined" | "expired" | "cancelled" | "timeout";
  username?: string;
  message?: string;
  profilePicture?: string;
  showActions?: boolean;
  showCancelOnly?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  autoHideDuration?: number;
  onAutoHideComplete?: () => void;
}

/**
 * NotificationCard component displays a single PvP notification with various states
 */
const NotificationCard: React.FC<NotificationCardProps> = ({
  type = "pending",
  username,
  message,
  profilePicture,
  showActions = false,
  showCancelOnly = false,
  onAccept = () => {},
  onDecline = () => {},
  onCancel = () => {},
  autoHideDuration = 15000,
  onAutoHideComplete = () => {},
}) => {
  // Animation state for progress bar
  const [progress, setProgress] = React.useState(100);
  
  // Set up progress bar animation
  React.useEffect(() => {
    // Only animate for outgoing invitations
    const isOutgoingInvitation = showCancelOnly && type === "pending" && !message;
    if (!isOutgoingInvitation) return;
    
    console.log(`Setting up progress animation with duration: ${autoHideDuration}ms`);
    const startTime = Date.now();
    const endTime = startTime + autoHideDuration;
    
    const animateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / autoHideDuration) * 100;
      
      setProgress(newProgress);
      
      if (newProgress > 0) {
        animationRef.current = requestAnimationFrame(animateProgress);
      } else {
        // When progress reaches 0, trigger the cancel function to close the notification
        console.log('Progress bar completed, auto-closing notification');
        try {
          // Log details before calling onCancel
          console.log('About to call onCancel due to progress bar completion', {
            type,
            username,
            autoHideDuration
          });
          
          // Call onCancel directly without conditions
          onCancel();
          
          // Also notify parent that animation is complete
          console.log('Calling onAutoHideComplete');
          onAutoHideComplete();
          
          // Special handling for timeouts - dispatch a custom event
          if (window && typeof window.dispatchEvent === 'function') {
            console.log('Dispatching invitation_timeout event');
            window.dispatchEvent(new CustomEvent('invitation_timeout', {
              detail: { username }
            }));
          }
        } catch (error) {
          console.error('Error calling onCancel:', error);
        }
      }
    };
    
    const animationRef = { current: requestAnimationFrame(animateProgress) };
    
    // Set a backup timer that will DEFINITELY trigger
    const backupTimer = setTimeout(() => {
      console.log('Backup timer triggered to close notification');
      try {
        console.log('Calling onCancel and onAutoHideComplete from backup timer');
        onCancel();
        onAutoHideComplete();
      } catch (error) {
        console.error('Error calling onCancel from backup timer:', error);
      }
    }, autoHideDuration); // No buffer - match exactly to ensure it triggers
    
    // Return cleanup function to handle component unmounting
    return () => {
      console.log('Cleaning up animation and timer');
      cancelAnimationFrame(animationRef.current);
      clearTimeout(backupTimer);
    };
  }, [type, showCancelOnly, message, autoHideDuration, onCancel, onAutoHideComplete, username]);

  // Format the message with the username if needed
  const formattedMessage = React.useMemo(() => {
    if (!message) {
      if (type === "cancelled" && username) {
        return `${username} has cancelled the PvP invitation.`;
      } else if (type === "timeout" && username) {
        return `PvP invitation from ${username} has expired.`;
      } else if (type === "expired" && username) {
        return `PvP invitation from ${username} has expired.`;
      } else {
        return username ? `${username} invites you to PvP!` : "";
      }
    }

    return message.replace("[username]", username || "");
  }, [message, username, type]);

  // Special case for outgoing invitation
  const isOutgoingInvitation = showCancelOnly && type === "pending" && !message;
  const outgoingMessage = isOutgoingInvitation && username ? `You invited ${username} to PvP.` : "";

  // Get background color based on notification type
  const getBackgroundColor = () => {
    if (isOutgoingInvitation) return 'bg-[#080511]';
    if (type === "cancelled") return 'bg-[#121212]';
    if (type === "timeout" || type === "expired") return 'bg-[#13131A]';
    return 'bg-gray-950';
  };

  // Get indicator color based on notification type
  const getIndicatorClass = () => {
    if (type === "accepted") return "bg-green-600";
    if (type === "declined") return "bg-pink-800";
    if (type === "cancelled") return "bg-[#A64747]";
    if (type === "timeout" || type === "expired") return "bg-gray-500";
    return "bg-gray-500"; // Default for other cases
  };

  return (
    <article 
      className={`
        flex relative items-center px-5 py-0 rounded-2xl h-[117px] w-[761px] 
        max-md:p-4 max-md:w-full max-md:h-auto max-md:min-w-80 max-sm:p-2.5
        ${getBackgroundColor()}
      `}
    >
      {/* Status indicator for non-pending notifications */}
      {type !== "pending" && (
        <div
          className={`absolute top-0 left-0 w-4 h-full ${getIndicatorClass()} rounded-tl-2xl rounded-bl-2xl`}
        />
      )}

      {/* Profile picture - positioned exactly as in the mockup for outgoing invitations */}
      <figure 
        className={`
          rounded-md overflow-hidden bg-zinc-300
          ${isOutgoingInvitation 
            ? 'h-[53px] w-[53px] ml-[52px] mr-[27px]' 
            : 'h-[53px] w-[53px] mr-7 max-md:mr-4 max-md:w-10 max-md:h-10 max-sm:mr-2.5 max-sm:h-[30px] max-sm:w-[30px]'}
        `}
      >
        <img 
          src={profilePicture || defaultPicture} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </figure>

      {/* Notification message */}
      <p className={`
        ${isOutgoingInvitation 
          ? 'text-2xl text-white font-normal' 
          : 'text-2xl text-white max-md:text-lg max-sm:text-base'}
      `}>
        {/* Special case for outgoing invitation */}
        {isOutgoingInvitation && outgoingMessage}

        {/* Regular notifications */}
        {!isOutgoingInvitation && (
          <>
            {/* Standard pending invitation */}
            {username && !message && type === "pending" && (
              <>
                <span className="font-bold">{username}</span>
                <span> invites you to PvP!</span>
              </>
            )}

            {/* Cancelled or Expired invitations */}
            {(type === "cancelled" || type === "timeout" || type === "expired") && !message && (
              <span>{formattedMessage}</span>
            )}

            {/* For messages without username formatting */}
            {formattedMessage && !username && <span>{formattedMessage}</span>}

            {/* For messages with username formatting */}
            {formattedMessage && username && message && (
              <>
                {formattedMessage.split("[username]").map((part, index, array) => {
                  // If this is the last part and there's no username to add after it
                  if (index === array.length - 1) {
                    return <span key={index}>{part}</span>;
                  }

                  // Return the part followed by the username in bold
                  return (
                    <React.Fragment key={index}>
                      <span>{part}</span>
                      <span className="font-bold">{username}</span>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </>
        )}
      </p>

      {/* Action buttons */}
      {showActions && (
        <ActionButtons onAccept={onAccept} onDecline={onDecline} />
      )}

      {/* Cancel button - exactly as in the mockup */}
      {showCancelOnly && (
        <button
          onClick={onCancel}
          className={`
            ${isOutgoingInvitation 
              ? 'absolute right-5 top-[38px] p-2.5 text-base font-bold text-white bg-[#A64747] rounded-[10px] border border-solid border-stone-300 border-opacity-0 w-[108px] h-[40px]' 
              : 'absolute right-5 p-2.5 text-base text-white bg-pink-800 rounded-xl border border-solid border-stone-300 border-opacity-0'}
          `}
        >
          CANCEL
        </button>
      )}

      {/* Progress indicator (only for outgoing invitations) */}
      {isOutgoingInvitation && (
        <div 
          className="absolute bottom-0 left-0 h-2 bg-[#D9D9D9] origin-left transition-all duration-100" 
          style={{ width: `${progress}%` }}
        ></div>
      )}
    </article>
  );
};

export default NotificationCard; 