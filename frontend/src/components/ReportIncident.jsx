import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const ReportIncident = () => {
  const { user } = useUser();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState("");
  const [nearbyIncidents, setNearbyIncidents] = useState([]);
  const [editingIncidentId, setEditingIncidentId] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [visibleComments, setVisibleComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  // Fetch user's current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        fetchNearbyIncidents(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setError("Unable to retrieve your location.");
      }
    );
  };

  // Fetch nearby incidents
  const fetchNearbyIncidents = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/incidents/nearby?latitude=${latitude}&longitude=${longitude}&radius=1`
      );
      setNearbyIncidents(response.data);
    } catch (error) {
      console.error("Error fetching nearby incidents:", error);
      setError("Failed to fetch nearby incidents.");
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to report an incident.");
      return;
    }

    if (!location.latitude || !location.longitude) {
      setError("Please allow location access to report an incident.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("description", description);
    formData.append("latitude", location.latitude);
    formData.append("longitude", location.longitude);
    images.forEach((image) => formData.append("images", image));

    try {
      const response = await axios.post("http://localhost:5000/api/incidents/report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Incident reported successfully!");
      setDescription("");
      setImages([]);
      setError("");
      fetchNearbyIncidents(location.latitude, location.longitude);
    } catch (error) {
      console.error("Error reporting incident:", error);
      setError("Failed to report incident.");
    }
  };

  // Handle upvote/downvote
  const handleVote = async (incidentId, voteType) => {
    try {
      await axios.post(`http://localhost:5000/api/incidents/${incidentId}/vote`, {
        userId: user.id,
        voteType,
      });
      fetchNearbyIncidents(location.latitude, location.longitude);
    } catch (error) {
      console.error("Error voting:", error);
      setError("Failed to vote on the incident.");
    }
  };

  // Handle adding a comment
  const handleComment = async (incidentId, comment) => {
    try {
      await axios.post(`http://localhost:5000/api/incidents/${incidentId}/comment`, {
        userId: user.id,
        comment,
      });
      fetchNearbyIncidents(location.latitude, location.longitude);
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment.");
    }
  };

  // Handle editing a comment
  const handleEditComment = (commentId, currentComment) => {
    setEditingCommentId(commentId); // Set the comment being edited
    setEditedCommentText(currentComment); // Set the current comment text for editing
  };

  // Save the edited comment
  const saveEditedComment = async (incidentId, commentId) => {
    try {
      await axios.put(`http://localhost:5000/api/incidents/${incidentId}/comments/${commentId}`, {
        userId: user.id, // Ensure this is the correct user ID
        newComment: editedCommentText, // Ensure this is the updated comment text
      });
      setEditingCommentId(null); // Stop editing
      fetchNearbyIncidents(location.latitude, location.longitude); // Refresh nearby incidents
    } catch (error) {
      console.error("Error updating comment:", error);
      setError("Failed to update comment.");
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (incidentId, commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/incidents/${incidentId}/comments/${commentId}`, {
        params: { userId: user.id }, // Send userId as a query parameter
      });
      fetchNearbyIncidents(location.latitude, location.longitude); // Refresh nearby incidents
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment.");
    }
  };

  // Handle editing an incident
  const handleEdit = (incidentId, currentDescription) => {
    setEditingIncidentId(incidentId); // Set the incident being edited
    setEditedDescription(currentDescription); // Set the current description for editing
  };

  // Save the edited incident
  const saveEdit = async (incidentId) => {
    try {
      await axios.put(`http://localhost:5000/api/incidents/${incidentId}`, {
        userId: user.id,
        description: editedDescription,
      });
      setEditingIncidentId(null); // Stop editing
      fetchNearbyIncidents(location.latitude, location.longitude); // Refresh nearby incidents
    } catch (error) {
      console.error("Error updating incident:", error);
      setError("Failed to update incident.");
    }
  };

  // Handle deleting an incident
  const deleteIncident = async (incidentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/incidents/${incidentId}`, {
        data: { userId: user.id },
      });
      fetchNearbyIncidents(location.latitude, location.longitude); // Refresh nearby incidents
    } catch (error) {
      console.error("Error deleting incident:", error);
      setError("Failed to delete incident.");
    }
  };

  // Toggle comments visibility
  const toggleComments = (incidentId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [incidentId]: !prev[incidentId],
    }));
  };

  // Fetch location and nearby incidents on component mount
  useEffect(() => {
    getLocation();
  }, []);

  // Sort incidents by net votes
  const sortedIncidents = nearbyIncidents.sort((a, b) => {
    const netVotesA = (a.upvoteCount || 0) - (a.downvoteCount || 0);
    const netVotesB = (b.upvoteCount || 0) - (b.downvoteCount || 0);
    return netVotesB - netVotesA;
  });

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Report an Incident</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Report Incident Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows="4"
            placeholder="Describe the incident..."
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Images (Max 5)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <button
            type="button"
            onClick={getLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Get Current Location
          </button>
          {location.latitude && location.longitude && (
            <p className="mt-2 text-sm text-gray-600">
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Report Incident
        </button>
      </form>

      {/* Display Nearby Incidents */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Nearby Incidents</h3>
        <div className="space-y-4">
          {sortedIncidents.map((incident) => (
            <div key={incident._id} className="bg-white p-4 rounded-lg shadow-md">
              {/* Description (inline editing) */}
              {editingIncidentId === incident._id ? (
                <div className="flex items-center space-x-2">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="2"
                  />
                  <button
                    onClick={() => saveEdit(incident._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-gray-700">{incident.description}</p>
              )}

              {/* Place Name */}
              <p className="text-sm text-gray-500">
                Location: {incident.location.placeName}
              </p>

              {/* Images */}
              <div className="mt-2">
                {incident.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000/${image}`}
                    alt={`Incident ${index}`}
                    className="w-24 h-24 object-cover mr-2"
                  />
                ))}
              </div>

              {/* Voting Buttons */}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleVote(incident._id, "upvote")}
                  className="bg-green-500 text-white px-3 py-1 rounded-md"
                >
                  Upvote ({incident.upvoteCount || 0})
                </button>
                <button
                  onClick={() => handleVote(incident._id, "downvote")}
                  className="bg-red-500 text-white px-3 py-1 rounded-md"
                >
                  Downvote ({incident.downvoteCount || 0})
                </button>
              </div>

              {/* Edit/Delete Buttons (for owner) */}
              {user && user.id === incident.userId && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(incident._id, incident.description)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteIncident(incident._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-4">
                <button
                  onClick={() => toggleComments(incident._id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  {visibleComments[incident._id] ? "Hide Comments" : "Show Comments"}
                </button>

                {visibleComments[incident._id] && (
                  <div className="mt-2">
                    {/* Add Comment Input */}
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full p-2 border rounded-md"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            handleComment(incident._id, e.target.value);
                            e.target.value = ""; // Clear input after submitting
                          }
                        }}
                      />
                    </div>

                    {/* Display Comments */}
                    <div className="mt-2 space-y-2">
                      {incident.comments.map((comment, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-md">
                          {editingCommentId === comment._id ? (
                            <div className="flex items-center space-x-2">
                              <textarea
                                value={editedCommentText}
                                onChange={(e) => setEditedCommentText(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                rows="2"
                              />
                              <button
                                onClick={() => saveEditedComment(incident._id, comment._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-md"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700">{comment.comment}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            By User {comment.userId} at {new Date(comment.timestamp).toLocaleString()}
                          </p>
                          {user && user.id === comment.userId && (
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleEditComment(comment._id, comment.comment)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(incident._id, comment._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;