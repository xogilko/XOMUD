lain.rom.testkit_atc = (action = 'init_and_callback') => {
    const commandFeed = document.getElementById('qomms');
    const scrollCli = document.getElementById('testkit_atc');
    const atc_key = 'atc_' + scrollCli.getAttribute('data-set');

    if (!lain.profile[atc_key]) {
        lain.profile[atc_key] = {};
    }

    if (action === 'init_and_callback' || action === 'init') {
        if (!lain.profile[atc_key].qomms) {
            const stringArray = [
                '/arch/ testkit cli (type & send "help")',
                ' (っ◔◡◔)っ✩･ﾟ✧*･ﾟ･✶･ﾟ･ﾟ*･ﾟ･✶･ﾟ'
            ];
            stringArray.forEach(item => {
                commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
            });
        } else {
            lain.profile[atc_key].qomms.forEach(item => {
                commandFeed.insertAdjacentHTML('beforeend', '<li>' + item + '</li>');
            });
        }
        setTimeout(scrollToBottom, 0);
    }

    if (action === 'callback') {
        commandFeed.insertAdjacentHTML('beforeend', '<li><b><i>' + lain.profile.sign + '</i></b> ' + qomms_entry.value + '</li>');
        scrollToBottom();
        setTimeout(() => { qomms_entry.value = ''; }, 0);
        updateQommsRecord();
    }
};

function updateQommsRecord() {
    const commandFeed = document.getElementById('qomms');
    const scrollCli = document.getElementById('testkit_atc');
    const atc_key = 'atc_' + scrollCli.getAttribute('data-set');
    let qommsList = commandFeed.getElementsByTagName('li');
    let qommsRecord = Array.from(qommsList).map(li => li.innerHTML);
    lain.profile[atc_key].qomms = qommsRecord;
}

function scrollToBottom() {
    const scrollCli = document.getElementById('testkit_atc');
    scrollCli.scrollTop = scrollCli.scrollHeight;
}

function clearQomms() {
    if (confirm('Are you sure you want to clear all qomms?')) {
        const commandFeed = document.getElementById('qomms');
        const scrollCli = document.getElementById('testkit_atc');
        const atc_key = 'atc_' + scrollCli.getAttribute('data-set');
        commandFeed.innerHTML = '';
        lain.profile[atc_key].qomms = [];
        console.log('Qomms cleared');
        updateQommsRecord();
    }
}

lain.rom.testkit_atc('init_and_callback');

document.getElementById('testkit_atc_mode').addEventListener('change', function() {
    const commandFeed = document.getElementById('qomms');
    const scrollCli = document.getElementById('testkit_atc');
    const atc_inputarea = document.getElementById('atc_inputarea');

    if (this.value === 'server') {
        let formHtml = '<form onsubmit="alice().rom.testkit_atc(\'callback\')" hx-post="https://star.xomud.quest/arch/command/" hx-trigger="submit" hx-target="#qomms" hx-swap="beforeend"><input type="text" name="set-message" id="qomms_entry" placeholder="/arch/..."><input type="submit" value="send"></form>';
        
        if (!document.getElementById('clear_qomms_button')) {
            formHtml = '<button id="clear_qomms_button" style="margin-right:10px;">clear</button>' + formHtml;
        }
        
        atc_inputarea.innerHTML = formHtml;
        
        if (!document.getElementById('clear_qomms_button').hasListener) {
            document.getElementById('clear_qomms_button').addEventListener('click', clearQomms);
            document.getElementById('clear_qomms_button').hasListener = true;
        }
        
        htmx.process(atc_inputarea);
    }

    if (this.value === 'client') {
        atc_inputarea.innerHTML = '<form id="testkit_atc_client"><input type="text" id="qomms_entry" placeholder=">..."><input type="submit" value="eval"></form>';
        
        document.getElementById('testkit_atc_client').addEventListener('submit', function(event) {
            event.preventDefault();
            if (confirm("ATC requests permission to execute a command!")) {
                commandFeed.insertAdjacentHTML('beforeend', '<li><b><i>' + lain.profile.sign + '</i></b> ' + qomms_entry.value + '</li>');
                scrollToBottom();
                try {
                    const result = eval(qomms_entry.value);
                    const resultString = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
                    
                    // Create a new list item for the result
                    const resultItem = document.createElement('li');
                    resultItem.textContent = resultString; // Set the text content to preserve plaintext
                    commandFeed.appendChild(resultItem); // Append the new list item to the command feed
                    
                    scrollToBottom();
                } catch (error) {
                    const errorItem = document.createElement('li');
                    errorItem.textContent = error; // Set the text content for the error
                    commandFeed.appendChild(errorItem); // Append the error item to the command feed
                    
                    scrollToBottom();
                }
                qomms_entry.value = '';
                updateQommsRecord();
            }
        });
    }
});

document.getElementById('testkit_atc_mode').dispatchEvent(new Event('change'));

const atc_templates = {
    'atc_temp_channel': (element) => { element.innerHTML = lain.chan; },
    'atc_temp_portal': (element) => { element.innerHTML = lain.portal; },
    'atc_temp_aux': (element) => { element.innerHTML = document.querySelector('meta[portal][aux]').getAttribute('aux'); }
};

const observer = new MutationObserver((mutations) => {
    const commandFeed = document.getElementById('qomms');
    const scrollCli = document.getElementById('testkit_atc');
    
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            scrollToBottom();
            const lastListItem = commandFeed.lastElementChild;
            if (lastListItem) {
                Object.keys(atc_templates).forEach((templateId) => {
                    const templateElement = lastListItem.querySelector('#' + templateId);
                    if (templateElement) {
                        atc_templates[templateId](templateElement);
                    }
                });
            }
            updateQommsRecord();
        }
    });
});

observer.observe(document.getElementById('qomms'), { childList: true });
