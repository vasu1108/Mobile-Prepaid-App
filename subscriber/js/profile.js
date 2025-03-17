const userData = {
    name: 'Shreenivasan S',
    dob: '08 Nov, 2003',
    mobile: '9876543210',
    alternateContact: '8838512345',
    email: 'user@example.com',
    communicationLanguage: 'EN',
    workDetails: 'Software Engineer',
    address: '4-13, Linemedu , Salem, Tn-636006'
};

const nonEditableFields = ['dob', 'mobile', 'address'];

function createField(key, value) {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'field-group';

    const label = document.createElement('div');
    label.className = 'field-label';
    label.textContent = formatLabel(key);

    const valueContainer = document.createElement('div');
    valueContainer.className = 'field-value';

    if (nonEditableFields.includes(key)) {
        valueContainer.textContent = value;
        const nonEditableText = document.createElement('span');
        nonEditableText.className = 'non-editable-text';
        nonEditableText.textContent = '(Not editable)';
        valueContainer.appendChild(nonEditableText);
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.className = 'field-input';
        input.readOnly = true;
        
        const editButton = document.createElement('button');
        editButton.className = 'edit-button';
        editButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        
        editButton.addEventListener('click', () => {
            input.readOnly = false;
            input.focus();
        });

        input.addEventListener('blur', () => {
            input.readOnly = true;
            userData[key] = input.value;
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });

        valueContainer.appendChild(input);
        fieldGroup.appendChild(editButton);
    }

    fieldGroup.appendChild(label);
    fieldGroup.appendChild(valueContainer);
    return fieldGroup;
}

function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .split(/(?=[A-Z])/)
        .join(' ')
        .toLowerCase()
        .replace(/^\w/, c => c.toUpperCase());
}

function initializeForm() {
    const form = document.getElementById('settings-form');
    for (const [key, value] of Object.entries(userData)) {
        form.appendChild(createField(key, value));
    }
}

document.addEventListener('DOMContentLoaded', initializeForm);