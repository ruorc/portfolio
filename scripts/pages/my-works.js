import { writeDebugLog } from '@logger';

export default function initialize(pageContainer = null) {
    if (!pageContainer) return;

    const toggleProjectsButton = pageContainer.querySelector('#toggle-vanilla-js-projects');
    const projectsListContainer = pageContainer.querySelector('#vanilla-js-projects-list');

    if (!toggleProjectsButton || !projectsListContainer) {
        return;
    }

    const toggleProjectsVisibility = () => {
        const isListHidden = projectsListContainer.classList.toggle('hidden');
        
        toggleProjectsButton.textContent = isListHidden ? 'Show projects' : 'Hide projects';
        
        if (!isListHidden) {
            projectsListContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    toggleProjectsButton.addEventListener('click', toggleProjectsVisibility);

    return () => {
        toggleProjectsButton.removeEventListener('click', toggleProjectsVisibility);
    };
}
