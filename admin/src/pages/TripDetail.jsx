import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { tripsAPI, usersAPI } from '../utils/api';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import ConfirmModal from '../components/molecules/ConfirmModal';
import EventForm from '../components/organisms/EventForm_GALLERIES';
import DayManager from '../components/organisms/DayManager';
import DocumentManager from '../components/organisms/DocumentManager';
import CheckInMap from '../components/organisms/CheckInMap';
import styles from './TripDetail.module.css';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [trip, setTrip] = useState(null);
  const [events, setEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Teacher assignment modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Confirm modal for teacher removal
  const [confirmTeacherModal, setConfirmTeacherModal] = useState({ isOpen: false, userId: null, teacherName: '' });

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      setLoading(true);

      // Fetch trip
      const tripResponse = await tripsAPI.getById(id);
      setTrip(tripResponse.data);

      // Fetch events
      const eventsResponse = await tripsAPI.getEvents(id);
      setEvents(eventsResponse.data);

      // Fetch assigned teachers
      const teachersResponse = await tripsAPI.getTeachers(id);
      setAssignedTeachers(teachersResponse.data);

    } catch (err) {
      console.error('Failed to fetch trip data:', err);
      showError(err.response?.data?.error || err.message || 'Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (formData) => {
    try {
      setSubmittingEvent(true);

      const url = editingEvent?.id
        ? `/api/trips/${id}/events/${editingEvent.id}`
        : `/api/trips/${id}/events`;

      const method = editingEvent?.id ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: formData, // FormData from EventForm
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save event');
      }

      // Parse and return the saved event so EventForm can upload media
      const savedEvent = await response.json();

      // Don't close modal or show success yet - let EventForm handle that after media uploads
      setSubmittingEvent(false);
      return savedEvent;
    } catch (err) {
      console.error('Failed to save event:', err);
      showError(err.message || 'Failed to save event');
      setSubmittingEvent(false);
      throw err; // Re-throw so EventForm knows it failed
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/trips/${id}/events/${eventId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('Failed to delete event');

      success('Event deleted successfully');
      fetchTripData();
    } catch (err) {
      console.error('Failed to delete event:', err);
      showError('Failed to delete event');
    }
  };

  const handleMoveEventUp = async (eventId, currentIndex) => {
    if (currentIndex === 0) return;

    const targetEvent = events.find(e => e.orderIndex === currentIndex - 1);
    if (!targetEvent) return;

    try {
      // Swap order indexes
      await Promise.all([
        fetch(`/api/trips/${id}/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: currentIndex - 1 }),
          credentials: 'include'
        }),
        fetch(`/api/trips/${id}/events/${targetEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: currentIndex }),
          credentials: 'include'
        })
      ]);

      fetchTripData();
    } catch (err) {
      console.error('Failed to reorder events:', err);
      showError('Failed to reorder events');
    }
  };

  const handleMoveEventDown = async (eventId, currentIndex) => {
    if (currentIndex === events.length - 1) return;

    const targetEvent = events.find(e => e.orderIndex === currentIndex + 1);
    if (!targetEvent) return;

    try {
      // Swap order indexes
      await Promise.all([
        fetch(`/api/trips/${id}/events/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: currentIndex + 1 }),
          credentials: 'include'
        }),
        fetch(`/api/trips/${id}/events/${targetEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: currentIndex }),
          credentials: 'include'
        })
      ]);

      fetchTripData();
    } catch (err) {
      console.error('Failed to reorder events:', err);
      showError('Failed to reorder events');
    }
  };

  // Publish/Unpublish handlers
  const handleTogglePublish = async () => {
    try {
      if (trip.published) {
        await tripsAPI.unpublish(id);
      } else {
        await tripsAPI.publish(id);
      }

      success(`Trip ${trip.published ? 'unpublished' : 'published'} successfully`);
      fetchTripData();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      showError(err.response?.data?.error || 'Failed to update trip status');
    }
  };

  // Teacher handlers
  const fetchAllTeachers = async () => {
    try {
      const response = await usersAPI.getAll({ role: 'teacher' });
      setTeachers(response.data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      showError(err.response?.data?.error || err.message || 'Failed to load teachers');
    }
  };

  const handleOpenTeacherModal = () => {
    fetchAllTeachers();
    setIsTeacherModalOpen(true);
    setEditingTeacher(null);
  };

  const handleAssignTeacher = async (teacher) => {
    try {
      await tripsAPI.assignTeacher(id, teacher.id, {
        showPhone: false,
        showEmail: false,
        orderIndex: assignedTeachers.length
      });
      success('Teacher assigned successfully');
      fetchTripData();
      setIsTeacherModalOpen(false);
    } catch (err) {
      console.error('Failed to assign teacher:', err);
      showError(err.response?.data?.error || err.message || 'Failed to assign teacher');
    }
  };

  const handleUpdateTeacherVisibility = async (teacher, showPhone, showEmail) => {
    try {
      await tripsAPI.updateTeacher(id, teacher.user_id || teacher.userId, {
        showPhone,
        showEmail
      });
      success('Teacher visibility updated');
      fetchTripData();
    } catch (err) {
      console.error('Failed to update teacher visibility:', err);
      showError(err.response?.data?.error || err.message || 'Failed to update teacher visibility');
    }
  };

  const handleRemoveTeacherClick = (teacher) => {
    const userId = teacher.user_id || teacher.userId;
    const teacherName = `${teacher.first_name || teacher.firstName} ${teacher.last_name || teacher.lastName}`;
    setConfirmTeacherModal({
      isOpen: true,
      userId: userId,
      teacherName: teacherName
    });
  };

  const handleRemoveTeacher = async () => {
    const userId = confirmTeacherModal.userId;

    try {
      await tripsAPI.removeTeacher(id, userId);
      setConfirmTeacherModal({ isOpen: false, userId: null, teacherName: '' });
      success('Teacher removed successfully');
      fetchTripData();
    } catch (err) {
      console.error('Failed to remove teacher:', err);
      setConfirmTeacherModal({ isOpen: false, userId: null, teacherName: '' });
      showError(err.response?.data?.error || err.message || 'Failed to remove teacher');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className={styles.errorContainer}>
        <h2>Trip not found</h2>
        <Button onClick={() => navigate('/trips')}>Back to Trips</Button>
      </div>
    );
  }

  return (
    <div className={styles.tripDetail}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/trips')}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      </div>

      {/* Trip Overview */}
      <Card className={styles.tripCard}>
        <div className={styles.tripHeader}>
          <div>
            <h1 className={styles.title}>{trip.title}</h1>
            <p className={styles.description}>{trip.description}</p>
          </div>
          <div className={styles.tripActions}>
            <Badge variant={trip.published ? 'success' : 'warning'}>
              {trip.published ? 'Published' : 'Draft'}
            </Badge>
            <Button
              size="small"
              variant={trip.published ? 'secondary' : 'primary'}
              onClick={handleTogglePublish}
            >
              {trip.published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Assigned Teachers Section */}
      <Card>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Assigned Teachers</h2>
          <Button size="small" onClick={handleOpenTeacherModal}>
            Assign Teacher
          </Button>
        </div>

        {assignedTeachers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No teachers assigned yet. Assign teachers to provide contact information for students.</p>
          </div>
        ) : (
          <div className={styles.teacherList}>
            {assignedTeachers.map((teacher) => (
              <div key={teacher.user_id || teacher.userId} className={styles.teacherItem}>
                <div className={styles.teacherInfo}>
                  <strong>
                    {teacher.first_name || teacher.firstName} {teacher.last_name || teacher.lastName}
                  </strong>
                  <div className={styles.teacherContact}>
                    {teacher.email && (
                      <span className={styles.contactItem}>
                        {teacher.email}
                        <input
                          type="checkbox"
                          checked={teacher.show_email === 1 || teacher.showEmail}
                          onChange={(e) =>
                            handleUpdateTeacherVisibility(
                              teacher,
                              teacher.show_phone === 1 || teacher.showPhone,
                              e.target.checked
                            )
                          }
                          title="Show email to students"
                        />
                      </span>
                    )}
                    {teacher.phone_number || teacher.phoneNumber ? (
                      <span className={styles.contactItem}>
                        {teacher.phone_number || teacher.phoneNumber}
                        <input
                          type="checkbox"
                          checked={teacher.show_phone === 1 || teacher.showPhone}
                          onChange={(e) =>
                            handleUpdateTeacherVisibility(
                              teacher,
                              e.target.checked,
                              teacher.show_email === 1 || teacher.showEmail
                            )
                          }
                          title="Show phone to students"
                        />
                      </span>
                    ) : null}
                  </div>
                </div>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => handleRemoveTeacherClick(teacher)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Student Check-Ins Map */}
      {trip.published && (
        <Card>
          <CheckInMap tripId={id} />
        </Card>
      )}

      {/* Day Management Section */}
      <DayManager
        tripId={id}
        onUpdate={fetchTripData}
        onAddEvent={(dayId) => {
          setEditingEvent({ dayId });
          setIsEventModalOpen(true);
        }}
      />

      {/* Private Documents Section */}
      <DocumentManager tripId={id} />

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
          fetchTripData(); // Refresh trip data when modal closes
        }}
        title={editingEvent?.id ? 'Edit Event' : 'Create New Event'}
        size="large"
      >
        <EventForm
          event={editingEvent}
          onSave={handleEventSubmit}
          onCancel={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
            fetchTripData(); // Refresh trip data
          }}
          isLoading={submittingEvent}
        />
      </Modal>

      {/* Teacher Assignment Modal */}
      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title="Assign Teacher to Trip"
        size="small"
      >
        <div className={styles.teacherModalContent}>
          {teachers.filter(t => !assignedTeachers.some(at => (at.user_id || at.userId) === t.id)).length === 0 ? (
            <p>All teachers are already assigned to this trip.</p>
          ) : (
            <div className={styles.availableTeachersList}>
              {teachers
                .filter(t => !assignedTeachers.some(at => (at.user_id || at.userId) === t.id))
                .map((teacher) => (
                  <div key={teacher.id} className={styles.availableTeacherItem}>
                    <div>
                      <strong>{teacher.first_name || teacher.firstName} {teacher.last_name || teacher.lastName}</strong>
                      <div className={styles.teacherEmail}>{teacher.email}</div>
                    </div>
                    <Button size="small" onClick={() => handleAssignTeacher(teacher)}>
                      Assign
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Modal for Teacher Removal */}
      <ConfirmModal
        isOpen={confirmTeacherModal.isOpen}
        onClose={() => setConfirmTeacherModal({ isOpen: false, userId: null, teacherName: '' })}
        onConfirm={handleRemoveTeacher}
        title="Remove Teacher"
        message={`Are you sure you want to remove ${confirmTeacherModal.teacherName ? `"${confirmTeacherModal.teacherName}"` : 'this teacher'} from the trip?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
};

export default TripDetail;
