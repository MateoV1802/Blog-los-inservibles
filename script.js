document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const toggle = document.querySelector('.dropdown-toggle');

    if (toggle && dropdown) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
            
            // Toggle active aria state
            const isActive = dropdown.classList.contains('active');
            toggle.setAttribute('aria-expanded', isActive);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close dropdown with Escape key for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }
});
