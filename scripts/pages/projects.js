import { writeDebugLog } from '@logger';

export default function initialize(pageContainer = null) {
    if (!pageContainer) return;

    const toggleButtons = pageContainer.querySelectorAll('.btn-toggle-projects');

    const toggleProjectsVisibility = (event) => {
        const button = event.currentTarget;
        const targetId = button.dataset.target;
        const targetBlock = document.getElementById(targetId);

        if (!targetBlock) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const nextState = !isExpanded;

        targetBlock.classList.toggle('hidden', !nextState);
        targetBlock.toggleAttribute('hidden', !nextState);

        button.setAttribute('aria-expanded', String(nextState));
        button.textContent = nextState ? 'Hide projects' : 'Show projects';

        if (nextState) {
            targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    toggleButtons.forEach(btn => btn.addEventListener('click', toggleProjectsVisibility));

    return () => {
        toggleButtons.forEach(btn => btn.removeEventListener('click', toggleProjectsVisibility));
    };
}
