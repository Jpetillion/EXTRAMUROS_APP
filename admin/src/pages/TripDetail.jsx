import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI, modulesAPI, contentAPI } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Card from '../components/molecules/Card';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import Spinner from '../components/atoms/Spinner';
import Modal from '../components/molecules/Modal';
import ModuleForm from '../components/organisms/ModuleForm';
import ContentForm from '../components/organisms/ContentForm';
import styles from './TripDetail.module.css';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [trip, setTrip] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  // Module modal
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [submittingModule, setSubmittingModule] = useState(false);

  // Content modal
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [submittingContent, setSubmittingContent] = useState(false);

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const [tripResponse, modulesResponse] = await Promise.all([
        tripsAPI.getById(id),
        modulesAPI.getAll(id),
      ]);
      setTrip(tripResponse.data);
      setModules(modulesResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch trip data:', err);
      error('Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  // Module handlers
  const handleCreateModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setIsModuleModalOpen(true);
  };

  const handleModuleSubmit = async (formData) => {
    try {
      setSubmittingModule(true);
      if (editingModule) {
        await modulesAPI.update(id, editingModule.id, formData);
        success('Module updated successfully');
      } else {
        await modulesAPI.create(id, formData);
        success('Module created successfully');
      }
      setIsModuleModalOpen(false);
      setEditingModule(null);
      fetchTripData();
    } catch (err) {
      console.error('Failed to save module:', err);
      error(err?.data?.message || 'Failed to save module');
    } finally {
      setSubmittingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      await modulesAPI.delete(id, moduleId);
      success('Module deleted successfully');
      fetchTripData();
    } catch (err) {
      console.error('Failed to delete module:', err);
      error(err?.data?.message || 'Failed to delete module');
    }
  };

  // Content handlers
  const handleCreateContent = (moduleId) => {
    setCurrentModuleId(moduleId);
    setEditingContent(null);
    setIsContentModalOpen(true);
  };

  const handleEditContent = (moduleId, content) => {
    setCurrentModuleId(moduleId);
    setEditingContent(content);
    setIsContentModalOpen(true);
  };

  const handleContentSubmit = async (formData) => {
    try {
      setSubmittingContent(true);
      if (editingContent) {
        await contentAPI.update(id, currentModuleId, editingContent.id, formData);
        success('Content updated successfully');
      } else {
        await contentAPI.create(id, currentModuleId, formData);
        success('Content created successfully');
      }
      setIsContentModalOpen(false);
      setEditingContent(null);
      setCurrentModuleId(null);
      fetchTripData();
    } catch (err) {
      console.error('Failed to save content:', err);
      error(err?.data?.message || 'Failed to save content');
    } finally {
      setSubmittingContent(false);
    }
  };

  const handleDeleteContent = async (moduleId, contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await contentAPI.delete(id, moduleId, contentId);
      success('Content deleted successfully');
      fetchTripData();
    } catch (err) {
      console.error('Failed to delete content:', err);
      error(err?.data?.message || 'Failed to delete content');
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="17" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        );
      case 'image':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        );
      case 'audio':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        );
      default:
        return null;
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </Button>
      </div>

      <Card className={styles.tripCard}>
        <div className={styles.tripHeader}>
          <div>
            <h1 className={styles.title}>{trip.title}</h1>
            <p className={styles.description}>{trip.description}</p>
          </div>
          <Badge variant={trip.status === 'published' ? 'green' : 'yellow'}>
            {trip.status}
          </Badge>
        </div>

        <div className={styles.tripMeta}>
          <div className={styles.metaItem}>
            <strong>Location:</strong> {trip.location}
          </div>
          <div className={styles.metaItem}>
            <strong>City:</strong> {trip.city}
          </div>
          <div className={styles.metaItem}>
            <strong>Country:</strong> {trip.country}
          </div>
          {trip.duration && (
            <div className={styles.metaItem}>
              <strong>Duration:</strong> {trip.duration}
            </div>
          )}
          {trip.difficulty && (
            <div className={styles.metaItem}>
              <strong>Difficulty:</strong> {trip.difficulty}
            </div>
          )}
        </div>
      </Card>

      <div className={styles.modulesSection}>
        <div className={styles.sectionHeader}>
          <h2>Modules</h2>
          <Button onClick={handleCreateModule}>Add Module</Button>
        </div>

        {modules.length === 0 ? (
          <Card>
            <div className={styles.emptyState}>
              <p>No modules yet. Create your first module to get started.</p>
              <Button onClick={handleCreateModule}>Add Module</Button>
            </div>
          </Card>
        ) : (
          <div className={styles.modulesList}>
            {modules.map((module) => (
              <Card key={module.id} className={styles.moduleCard}>
                <div className={styles.moduleHeader} onClick={() => toggleModule(module.id)}>
                  <div className={styles.moduleTitle}>
                    <h3>{module.title}</h3>
                    <Badge variant="default" size="small">
                      {module.content?.length || 0} items
                    </Badge>
                  </div>
                  <div className={styles.moduleActions}>
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModule(module);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                    >
                      Delete
                    </Button>
                    <button className={styles.expandButton}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: expandedModule === module.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {expandedModule === module.id && (
                  <div className={styles.moduleContent}>
                    <p className={styles.moduleDescription}>{module.description}</p>

                    <div className={styles.contentHeader}>
                      <h4>Content</h4>
                      <Button
                        size="small"
                        onClick={() => handleCreateContent(module.id)}
                      >
                        Add Content
                      </Button>
                    </div>

                    {!module.content || module.content.length === 0 ? (
                      <div className={styles.emptyContent}>
                        <p>No content in this module yet.</p>
                      </div>
                    ) : (
                      <div className={styles.contentList}>
                        {module.content.map((content) => (
                          <div key={content.id} className={styles.contentItem}>
                            <div className={styles.contentInfo}>
                              <span className={styles.contentIcon}>
                                {getContentTypeIcon(content.type)}
                              </span>
                              <div>
                                <p className={styles.contentTitle}>{content.title}</p>
                                <Badge variant="info" size="small">
                                  {content.type}
                                </Badge>
                              </div>
                            </div>
                            <div className={styles.contentActions}>
                              <Button
                                size="small"
                                variant="ghost"
                                onClick={() => handleEditContent(module.id, content)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="ghost"
                                onClick={() => handleDeleteContent(module.id, content.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Module Modal */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title={editingModule ? 'Edit Module' : 'Create New Module'}
        size="medium"
      >
        <ModuleForm
          initialData={editingModule}
          onSubmit={handleModuleSubmit}
          onCancel={() => setIsModuleModalOpen(false)}
          loading={submittingModule}
        />
      </Modal>

      {/* Content Modal */}
      <Modal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        title={editingContent ? 'Edit Content' : 'Create New Content'}
        size="large"
      >
        <ContentForm
          initialData={editingContent}
          onSubmit={handleContentSubmit}
          onCancel={() => setIsContentModalOpen(false)}
          loading={submittingContent}
        />
      </Modal>
    </div>
  );
};

export default TripDetail;
