import { useState } from 'react';
import { Badge } from '../atoms/Badge.jsx';
import { sortByOrder } from '../../utils/helpers.js';
import './ModuleList.css';

export function ModuleList({ modules, onModuleClick, completedContents = [] }) {
  const [expandedModule, setExpandedModule] = useState(null);

  const sortedModules = sortByOrder(modules || []);

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const getModuleProgress = (module) => {
    if (!module.contents || module.contents.length === 0) return 0;

    const completed = module.contents.filter(content =>
      completedContents.includes(content.id)
    ).length;

    return Math.round((completed / module.contents.length) * 100);
  };

  return (
    <div className="module-list">
      {sortedModules.map((module) => {
        const isExpanded = expandedModule === module.id;
        const progress = getModuleProgress(module);
        const hasContents = module.contents && module.contents.length > 0;

        return (
          <div key={module.id} className="module-list__item">
            <div
              className="module-list__header"
              onClick={() => hasContents && toggleModule(module.id)}
            >
              <div className="module-list__title-section">
                {hasContents && (
                  <span className="module-list__toggle">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                <h3 className="module-list__title">{module.title}</h3>
              </div>

              <div className="module-list__meta">
                {hasContents && (
                  <Badge
                    variant={progress === 100 ? 'success' : 'info'}
                    size="small"
                  >
                    {progress}%
                  </Badge>
                )}
              </div>
            </div>

            {module.description && (
              <p className="module-list__description">{module.description}</p>
            )}

            {isExpanded && hasContents && (
              <div className="module-list__contents">
                {sortByOrder(module.contents).map((content) => {
                  const isCompleted = completedContents.includes(content.id);

                  return (
                    <div
                      key={content.id}
                      className={`module-list__content ${isCompleted ? 'module-list__content--completed' : ''}`}
                      onClick={() => onModuleClick && onModuleClick(module.id, content.id)}
                    >
                      <span className="module-list__content-icon">
                        {getContentIcon(content.type)}
                      </span>
                      <span className="module-list__content-title">
                        {content.title}
                      </span>
                      {isCompleted && (
                        <span className="module-list__content-check">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getContentIcon(type) {
  const icons = {
    text: '📝',
    image: '🖼️',
    audio: '🎵',
    location: '📍',
    schedule: '📅',
    activity: '✓'
  };
  return icons[type] || '📄';
}
