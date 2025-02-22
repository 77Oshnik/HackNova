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
      console.log(response.data);
      
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
    <div className="max-w-3xl mx-auto py-8 px-4">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Report Form Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Report an Incident</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows="4"
              placeholder="Describe the incident..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <button
              type="button"
              onClick={getLocation}
              className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              Get Current Location
            </button>
            {location.latitude && location.longitude && (
              <p className="mt-2 text-sm text-gray-500">
                Latitude: {location.latitude}, Longitude: {location.longitude}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          >
            Submit Report
          </button>
        </form>
      </div>

      {/* Nearby Incidents Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Nearby Incidents</h3>
        <div className="space-y-4">
          {sortedIncidents.map((incident) => (
            <div key={incident._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {/* Incident Content */}
              <div className="flex items-start space-x-4">
                {/* Voting Section */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleVote(incident._id, "upvote")}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {(incident.upvoteCount || 0) - (incident.downvoteCount || 0)}
                  </span>
                  <button
                    onClick={() => handleVote(incident._id, "downvote")}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                  {editingIncidentId === incident._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="2"
                      />
                      <button
                        onClick={() => saveEdit(incident._id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900 mb-2">{incident.description}</p>
                  )}

                  <p className="text-sm text-gray-500 mb-4">
                    Location: {incident.location.placeName}
                  </p>

                  {/* Images Grid */}
                  {incident.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {incident.images.map((image, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000/${image}`}
                          alt={`Incident ${index}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => toggleComments(incident._id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {visibleComments[incident._id] ? "Hide Comments" : "Show Comments"}
                    </button>
                    {user && user.id === incident.userId && (
                      <>
                        <button
                          onClick={() => handleEdit(incident._id, incident.description)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteIncident(incident._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {/* Comments Section */}
                  {visibleComments[incident._id] && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-100">
                      {/* Add Comment */}
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && e.target.value.trim()) {
                              handleComment(incident._id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {incident.comments.map((comment, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3">
                            {editingCommentId === comment._id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editedCommentText}
                                  onChange={(e) => setEditedCommentText(e.target.value)}
                                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  rows="2"
                                />
                                <button
                                  onClick={() => saveEditedComment(incident._id, comment._id)}
                                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-900">{comment.comment}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    By User {comment.userId} • {new Date(comment.timestamp).toLocaleString()}
                                  </p>
                                  {user && user.id === comment.userId && (
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleEditComment(comment._id, comment.comment)}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(incident._id, comment._id)}
                                        className="text-xs text-red-500 hover:text-red-700"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;