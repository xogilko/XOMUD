export function activate_module(lain) {
    lain.rom.testkit_cssmod = () => {
        const populateCSSClassesDropdown = () => {
            const classDropdown = document.getElementById("retouchClass");
            classDropdown.innerHTML = '';
            const uniqueClassSet = new Set();
            uniqueClassSet.add('body');
            document.querySelectorAll('*').forEach(element => {
                if (element.classList.length > 0) {
                    element.classList.forEach(className => {
                        uniqueClassSet.add('.' + className); // Add each class to the set
                    });
                }
            });
            uniqueClassSet.forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                classDropdown.appendChild(option);
            });
        };

        const targetElement = document.getElementById("testkit_csspaint");
        if (!targetElement) {
            console.error('Target element not found');
            return;
        }

        const retouch = () => {
            console.log('retouch');
            let retouch_class = document.getElementById("retouchClass").value;
            let retouch_property = document.getElementById("retouchProperty").value;
            let retouch_value = document.getElementById("retouchValue").value;
            lain.rom.manageCSS().modifyCSSProperty(retouch_class, retouch_property, retouch_value);
        };
        document.getElementById('testkit_csspaint_refresh').addEventListener('click', populateCSSClassesDropdown);
        document.getElementById('testkit_csspaint_retouch').addEventListener('click', retouch);
        populateCSSClassesDropdown(); // Call this function to populate the dropdown on module activation
    };

    lain.rom.testkit_cssmod();
}