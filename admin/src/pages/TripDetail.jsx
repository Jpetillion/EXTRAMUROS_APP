import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { tripsAPI, classesAPI, usersAPI } from '../utils/api';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import EventForm from '../components/organisms/EventForm';
import styles from './TripDetail.module.css';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [trip, setTrip] = useState(null);
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [progressReport, setProgressReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Event modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Class assignment modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Teacher assignment modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Progress modal
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

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

      // Fetch assigned classes
      const classesResponse = await tripsAPI.getClasses(id);
      setAssignedClasses(classesResponse.data);

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

  const fetchAllClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      showError(err.response?.data?.error || err.message || 'Failed to load classes');
    }
  };

  const fetchProgressReport = async () => {
    try {
      setLoadingProgress(true);
      const response = await fetch(`/api/stats/trips/${id}/progress`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch progress report');
      const data = await response.json();
      setProgressReport(data);
      setIsProgressModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch progress report:', err);
      showError('Failed to load progress report');
    } finally {
      setLoadingProgress(false);
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

      const url = editingEvent
        ? `/api/trips/${id}/events/${editingEvent.id}`
        : `/api/trips/${id}/events`;

      const method = editingEvent ? 'PUT' : 'POST';

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

      success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
      setIsEventModalOpen(false);
      setEditingEvent(null);
      fetchTripData();
    } catch (err) {
      console.error('Failed to save event:', err);
      showError(err.message || 'Failed to save event');
    } finally {
      setSubmittingEvent(false);
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
      const endpoint = trip.published ? 'unpublish' : 'publish';
      const response = await fetch(`/api/trips/${id}/${endpoint}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`Failed to ${endpoint} trip`);

      success(`Trip ${trip.published ? 'unpublished' : 'published'} successfully`);
      fetchTripData();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
      showError('Failed to update trip status');
    }
  };

  // Class assignment handlers
  const handleOpenClassModal = () => {
    fetchAllClasses();
    setIsClassModalOpen(true);
  };

  const handleAssignClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/trips/${id}/classes/${classId}`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to assign class');
      }

      success('Class assigned successfully');
      fetchTripData();
      setIsClassModalOpen(false);
    } catch (err) {
      console.error('Failed to assign class:', err);
      showError(err.message || 'Failed to assign class');
    }
  };

  const handleRemoveClass = async (classId) => {
    if (!window.confirm('Are you sure you want to remove this class from the trip?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/trips/${id}/classes/${classId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('Failed to remove class');

      success('Class removed successfully');
      fetchTripData();
    } catch (err) {
      console.error('Failed to remove class:', err);
      showError('Failed to remove class');
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

  const handleRemoveTeacher = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this teacher from the trip?')) {
      return;
    }

    try {
      await tripsAPI.removeTeacher(id, userId);
      success('Teacher removed successfully');
      fetchTripData();
    } catch (err) {
      console.error('Failed to remove teacher:', err);
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

  // Filter available classes (not already assigned)
  const availableClasses = classes.filter(
    cls => !assignedClasses.some(ac => ac.id === cls.id)
  );

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

      {/* Assigned Classes Section */}
      <Card>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Assigned Classes</h2>
          <Button size="small" onClick={handleOpenClassModal}>
            Assign to Class
          </Button>
        </div>

        {assignedClasses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No classes assigned yet. Assign this trip to classes to make it available to students.</p>
          </div>
        ) : (
          <div className={styles.classList}>
            {assignedClasses.map((cls) => (
              <div key={cls.id} className={styles.classItem}>
                <div>
                  <strong>{cls.name}</strong>
                  {cls.schoolYear && <span className={styles.schoolYear}> ({cls.schoolYear})</span>}
                </div>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => handleRemoveClass(cls.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
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
                  onClick={() => handleRemoveTeacher(teacher.user_id || teacher.userId)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Progress Report Section */}
      {trip.published && (
        <Card>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Student Progress</h2>
            <Button
              size="small"
              onClick={fetchProgressReport}
              loading={loadingProgress}
            >
              View Progress Report
            </Button>
          </div>
        </Card>
      )}

      {/* Events Section */}
      <Card>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Events ({events.length})</h2>
          {events.length > 0 && (
            <Button onClick={handleCreateEvent}>Add Event</Button>
          )}
        </div>

        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No events yet. Create your first event to get started.</p>
            <Button onClick={handleCreateEvent}>Add Event</Button>
          </div>
        ) : (
          <div className={styles.eventsList}>
            {events.map((event, index) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventOrder}>
                  <span className={styles.orderNumber}>{index + 1}</span>
                  <div className={styles.orderActions}>
                    <button
                      onClick={() => handleMoveEventUp(event.id, index)}
                      disabled={index === 0}
                      className={styles.orderButton}
                      title="Move up"
                    >
                      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveEventDown(event.id, index)}
                      disabled={index === events.length - 1}
                      className={styles.orderButton}
                      title="Move down"
                    >
                      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.eventContent}>
                  <div className={styles.eventHeader}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    {event.category && (
                      <Badge variant="info" size="small">{event.category}</Badge>
                    )}
                  </div>

                  <div className={styles.eventMeta}>
                    {event.durationMinutes && (
                      <span className={styles.metaItem}>
                        <svg className={styles.metaIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.durationMinutes} min
                      </span>
                    )}
                    {event.lat && event.lng && (
                      <span className={styles.metaItem}>
                        <svg className={styles.metaIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                      </span>
                    )}
                  </div>

                  <div className={styles.eventMedia}>
                    {event.hasImage && (
                      <span className={styles.mediaIndicator} title="Has image">
                        <svg className={styles.mediaIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                    )}
                    {event.hasAudio && (
                      <span className={styles.mediaIndicator} title="Has audio">
                        <svg className={styles.mediaIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </span>
                    )}
                    {event.videoUrl && (
                      <span className={styles.mediaIndicator} title="Has video">
                        <svg className={styles.mediaIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    )}
                    {event.textContent && (
                      <span className={styles.mediaIndicator} title="Has text content">
                        <svg className={styles.mediaIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.eventActions}>
                  <Button size="small" variant="ghost" onClick={() => handleEditEvent(event)}>
                    Edit
                  </Button>
                  <Button size="small" variant="ghost" onClick={() => handleDeleteEvent(event.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
        size="large"
      >
        <EventForm
          event={editingEvent}
          onSave={handleEventSubmit}
          onCancel={() => setIsEventModalOpen(false)}
          isLoading={submittingEvent}
        />
      </Modal>

      {/* Class Assignment Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Assign Trip to Class"
        size="small"
      >
        <div className={styles.classModalContent}>
          {availableClasses.length === 0 ? (
            <p>All classes are already assigned to this trip.</p>
          ) : (
            <div className={styles.availableClassesList}>
              {availableClasses.map((cls) => (
                <div key={cls.id} className={styles.availableClassItem}>
                  <div>
                    <strong>{cls.name}</strong>
                    {cls.schoolYear && <span className={styles.schoolYear}> ({cls.schoolYear})</span>}
                  </div>
                  <Button size="small" onClick={() => handleAssignClass(cls.id)}>
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {/* Progress Report Modal */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Student Progress Report"
        size="large"
      >
        {progressReport && (
          <div className={styles.progressReport}>
            <div className={styles.progressOverview}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{progressReport.totalStudents}</div>
                <div className={styles.statLabel}>Total Students</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{progressReport.totalEvents}</div>
                <div className={styles.statLabel}>Total Events</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{progressReport.averageCompletion}%</div>
                <div className={styles.statLabel}>Average Completion</div>
              </div>
            </div>

            <div className={styles.progressSection}>
              <h3>Event Completion Stats</h3>
              <div className={styles.eventStatsList}>
                {progressReport.eventStats.map((stat) => (
                  <div key={stat.eventId} className={styles.eventStat}>
                    <div className={styles.eventStatTitle}>{stat.eventTitle}</div>
                    <div className={styles.eventStatBar}>
                      <div
                        className={styles.eventStatFill}
                        style={{ width: `${stat.completionPercentage}%` }}
                      />
                    </div>
                    <div className={styles.eventStatLabel}>
                      {stat.studentsCompleted} / {progressReport.totalStudents} students ({stat.completionPercentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.progressSection}>
              <h3>Student Progress Details</h3>
              <div className={styles.studentProgressList}>
                {progressReport.studentProgress.map((student) => (
                  <div key={student.email} className={styles.studentProgressItem}>
                    <div className={styles.studentEmail}>{student.email}</div>
                    <div className={styles.studentProgressBar}>
                      <div
                        className={styles.studentProgressFill}
                        style={{ width: `${student.progressPercentage}%` }}
                      />
                    </div>
                    <div className={styles.studentProgressLabel}>
                      {student.completedEvents} / {student.totalEvents} events ({student.progressPercentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TripDetail;
