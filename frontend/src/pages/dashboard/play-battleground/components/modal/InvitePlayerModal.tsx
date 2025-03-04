import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/CancelOutlined';
import InviteFriendList from "../../../../../assets/General/ModalFriendList.png"
import ProfileIcon from "../../../../../assets/profile-picture/kopibara-picture.png"

interface Player {
    id: number;
    name: string;
    level: number;
    profilePicture: string;
}

interface InvitePlayerModalProps {
    open: boolean;
    handleClose: () => void;
    playerName: string;
    onInvite: (friend: Player) => void;
}

const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({ open, handleClose, playerName, onInvite }) => {
    const [friends, setFriends] = useState([
        { id: 1, name: 'Alice', level: 1, profilePicture: ProfileIcon },
        { id: 2, name: 'Bob', level: 2, profilePicture: ProfileIcon },
        { id: 3, name: 'Charlie', level: 3, profilePicture: ProfileIcon },
        { id: 4, name: 'Diana', level: 4, profilePicture: ProfileIcon },
        { id: 5, name: 'Ethan', level: 5, profilePicture: ProfileIcon },
        { id: 6, name: 'Fiona', level: 6, profilePicture: ProfileIcon },
        { id: 7, name: 'Gina', level: 7, profilePicture: ProfileIcon },
    ]); // State variable for friends

    if (!open) return null;

    return (
        <Box className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            {/* Backdrop */}
            <Box className="absolute inset-0" onClick={handleClose}></Box>

            {/* Modal */}
            <div className="bg-[#080511] border-[#3B354D] border rounded-[1rem] w-[679px] h-[529px] p-5 sm:p-5 md:p-9 relative flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <Tooltip title="Close" enterDelay={100} arrow>
                    <IconButton onClick={handleClose} className="self-end hover:scale-110 transition-all duration-300">
                        <CloseIcon className="text-[#6F658D]" fontSize="large" />
                    </IconButton>
                </Tooltip>

                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                    <img src={InviteFriendList} alt="Invite Icon" className="w-16" />
                </div>
                <Typography variant="h6" className="text-white text-center mb-4">Invite Friends</Typography>

                {/* Friend List */}
                <div className="flex flex-col items-center mt-5 mb-5" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {friends.map((friend, index) => (
                        <div key={index} className="p-3 rounded-md w-[550px] flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <img
                                    src={ProfileIcon}
                                    alt="Avatar"
                                    className="w-14 h-14 rounded-[5px] mr-4 hover:scale-110 transition-all duration-300"
                                />
                                <div>
                                    <Typography className="text-white">{String(friend.name)}</Typography>
                                    <Typography sx={{ color: 'white', fontSize: '0.835rem' }}>LVL {String(friend.level)}</Typography>
                                </div>
                            </div>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: '#57A64E' }}
                                onClick={() => {
                                    onInvite(friend);
                                    handleClose();
                                }}
                            >
                                INVITE
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </Box>
    );
};

export default InvitePlayerModal; 