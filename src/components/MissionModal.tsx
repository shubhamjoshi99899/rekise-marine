import React from "react";
import Modal from "react-modal";

const MissionModal = ({ waypoints, onClose }) => {
  return (
    <Modal style={{ width: "50%" }} isOpen={true} onRequestClose={onClose}>
      <h2>Mission Waypoints</h2>
      <ul>
        {waypoints.map((wp, index) => (
          <li key={index}>
            WP{index.toString().padStart(2, "0")}: {wp.join(", ")}
          </li>
        ))}
      </ul>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default MissionModal;
