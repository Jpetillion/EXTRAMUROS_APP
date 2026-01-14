import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { classesAPI, tripsAPI } from '../utils/api';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import FormField from '../components/molecules/FormField';
import styles from './ClassDetail.module.css';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [classData, setClassData] = useState(null);
  const [assignedTrips, setAssignedTrips] = useState([]);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', schoolYear: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Assign trip modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);

      // Fetch class details
      const classResponse = await classesAPI.getById(id);
      setClassData(classResponse.data);

      // Fetch assigned trips
      const tripsResponse = await classesAPI.getTrips(id);
      setAssignedTrips(tripsResponse.data);

    } catch (err) {
      console.error('Failed to fetch class data:', err);
      showError(err.response?.data?.error || err.message || 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrips = async () => {
    try {
      // Fetch all published trips
      const response = await tripsAPI.getAll({ published: true });
      const allTrips = response.data;

      // Filter out already assigned trips
      const available = allTrips.filter(
        trip => !assignedTrips.some(at => at.id === trip.id)
      );
      setAvailableTrips(available);
    } catch (err) {
      console.error('Failed to fetch available trips:', err);
      showError(err.response?.data?.error || err.message || 'Failed to load available trips');
    }
  };

  const handleOpenEditModal = () => {
    setFormData({
      name: classData.name || '',
      schoolYear: classData.schoolYear || ''
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenAssignModal = () => {
    fetchAvailableTrips();
    setIsAssignModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      await classesAPI.update(id, formData);
      success('Class updated successfully');
      setIsEditModalOpen(false);
      fetchClassData();
    } catch (err) {
      console.error('Failed to update class:', err);
      showError(err.response?.data?.error || err.message || 'Failed to update class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTrip = async (tripId) => {
    try {
      await classesAPI.assignTrip(id, tripId);
      success('Trip assigned successfully');
      setIsAssignModalOpen(false);
      fetchClassData();
    } catch (err) {
      console.error('Failed to assign trip:', err);
      showError(err.response?.data?.error || err.message || 'Failed to assign trip');
    }
  };

  const handleRemoveTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to remove this trip from the class?')) {
      return;
    }

    try {
      await classesAPI.removeTrip(id, tripId);
      success('Trip removed successfully');
      fetchClassData();
    } catch (err) {
      console.error('Failed to remove trip:', err);
      showError(err.response?.data?.error || err.message || 'Failed to remove trip');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
        <p>Loading class details...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Class not found</h2>
        <Button onClick={() => navigate('/classes')}>Back to Classes</Button>
      </div>
    );
  }

  return (
    <div className={styles.classDetail}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/classes')}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      </div>

      <Card className={styles.classCard}>
        <div className={styles.classHeader}>
          <div>
            <h1 className={styles.title}>{classData.name}</h1>
            {classData.schoolYear && (
              <p className={styles.schoolYear}>School Year: {classData.schoolYear}</p>
            )}
          </div>
          <Button size="small" onClick={handleOpenEditModal}>
            Edit Class
          </Button>
        </div>
      </Card>

      <Card>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Assigned Trips ({assignedTrips.length})</h2>
          <Button size="small" onClick={handleOpenAssignModal}>
            Assign Trip
          </Button>
        </div>

        {assignedTrips.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No trips assigned yet. Assign trips to make them available to students in this class.</p>
          </div>
        ) : (
          <div className={styles.tripsList}>
            {assignedTrips.map((trip) => (
              <div key={trip.id} className={styles.tripCard}>
                <div className={styles.tripContent}>
                  <div className={styles.tripHeader}>
                    <h3 className={styles.tripTitle}>{trip.title}</h3>
                    <Badge variant={trip.published ? 'success' : 'warning'}>
                      {trip.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className={styles.tripDescription}>{trip.description}</p>
                </div>
                <div className={styles.tripActions}>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => handleRemoveTrip(trip.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Class"
        size="small"
      >
        <form onSubmit={handleUpdateClass} className={styles.form}>
          <FormField
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., 3A, 5B, Grade 6"
          />

          <FormField
            label="School Year"
            name="schoolYear"
            value={formData.schoolYear}
            onChange={handleChange}
            placeholder="e.g., 2025-2026"
          />

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Update Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Trip Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Trip to Class"
        size="medium"
      >
        <div className={styles.assignModalContent}>
          {availableTrips.length === 0 ? (
            <p>No available trips. All published trips are already assigned to this class.</p>
          ) : (
            <div className={styles.availableTripsList}>
              {availableTrips.map((trip) => (
                <div key={trip.id} className={styles.availableTripItem}>
                  <div>
                    <strong>{trip.title}</strong>
                    <p className={styles.tripDescription}>{trip.description}</p>
                  </div>
                  <Button size="small" onClick={() => handleAssignTrip(trip.id)}>
                    Assign
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClassDetail;
