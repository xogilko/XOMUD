export function activate_module(lain) {
    lain.rom.testkit_cssmod = () => {
        const targetElement = document.getElementById("testkit_retouch");
            if (!targetElement) {
                console.error('Target element not found');
            }
        const retouch = () => {
            console.log('retouch');
            let retouch_class = document.getElementById("retouchClass").value;
            let retouch_property = document.getElementById("retouchProperty").value;
            let retouch_value = document.getElementById("retouchValue").value;
        lain.rom.manageCSS().modifyCSSProperty(retouch_class, retouch_property, retouch_value);
        }
        document.getElementById('testkit_retouchButton').addEventListener('click', function() {retouch();});
    }
    lain.rom.testkit_cssmod();
}