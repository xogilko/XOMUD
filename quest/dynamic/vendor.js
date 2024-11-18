//HTML PORTION
<div id="vendor_interface">
    <div class="vendor_status">
        <h3>Vendor Interface 🏪</h3>
        <div id="status_message">Awaiting connection...</div>
    </div>
    <div id="register_section" style="display: none;">
        <button id="register_btn">Register Vendor</button>
    </div>
</div>
//JS PORTION
const statusMessage = document.getElementById('status_message');
const registerSection = document.getElementById('register_section');
const registerBtn = document.getElementById('register_btn');
let dots = 1;

async function checkVendorStatus(token, id) {
    console.log('Checking vendor status with token:', token, 'and id:', id);
    const response = await fetch(lain.portal + 'arch/vendor_check', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Waltar-ID': id
        }
    });
    
    console.log('Vendor check response:', response.status);
    const responseText = await response.text();
    console.log('Vendor check response text:', responseText);
    
    if (response.ok) {
        console.log('Vendor is secured');
        statusMessage.textContent = "Vendor secured!";
        registerSection.style.display = 'none';
    } else if (response.status === 404) {
        console.log('Vendor not found, showing register button');
        statusMessage.textContent = "Not registered as vendor";
        registerSection.style.display = 'block';
    }
}

async function registerVendor(token, id) {
    console.log('Attempting to register vendor with token:', token, 'and id:', id);
    const response = await fetch(lain.portal + 'arch/register_vendor', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Waltar-ID': id
        }
    });

    console.log('Register vendor response:', response.status);
    const responseText = await response.text();
    console.log('Register vendor response text:', responseText);

    if (response.ok) {
        console.log('Registration successful, rechecking status');
        statusMessage.textContent = "Registration successful!";
        setTimeout(() => checkVendorStatus(token, id), 1000);
    } else {
        console.log('Registration failed');
        statusMessage.textContent = "Registration failed!";
    }
}

registerBtn.addEventListener('click', () => {
    console.log('Register button clicked');
    if (lain.profile.waltar_token && lain.profile.waltar_id) {
        console.log('Credentials found, proceeding with registration');
        registerVendor(lain.profile.waltar_token, lain.profile.waltar_id);
    } else {
        console.log('Missing credentials:', {
            token: !!lain.profile.waltar_token,
            id: !!lain.profile.waltar_id
        });
    }
});

const connectionCheck = setInterval(() => {
    if (lain.profile.waltar_token && lain.profile.waltar_id) {
        console.log('Connection established, checking vendor status');
        clearInterval(connectionCheck);
        checkVendorStatus(lain.profile.waltar_token, lain.profile.waltar_id);
    } else {
        dots = dots % 3 + 1;
        statusMessage.textContent = "Awaiting connection" + ".".repeat(dots);
    }
}, 10000);

if (lain.profile.waltar_token && lain.profile.waltar_id) {
    console.log('Initial check - credentials found');
    checkVendorStatus(lain.profile.waltar_token, lain.profile.waltar_id);
} else {
    console.log('Initial check - awaiting credentials');
    setInterval(() => {
        dots = dots % 3 + 1;
        statusMessage.textContent = "Awaiting connection" + ".".repeat(dots);
    }, 500);
}