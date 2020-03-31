function Todo(name, $loginForm, $createForm, $list, $editForm, template, $spinner) { // eslint-disable-line
    this.loginForm = $loginForm;
    this.createForm = $createForm;
    this.list = $list;
    this.template = template;
    this.notes = [];
    this.name = name;
    this.editForm = $editForm;
    this.spinner = $spinner;
}

Todo.prototype.render = function() {
    const getTodo = 'https://todo.hillel.it/todo';
    this.spinner.removeAttribute('hidden');
    fetch(getTodo, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },

    })
        .then(response => response.json())
        .then(data => {
            this.list.innerHTML = '';
            data.forEach(note => {
                this.list.insertAdjacentHTML(
                    'afterbegin',
                    this.template(note)
                );
            });
            this.spinner.setAttribute('hidden', '');
        });
};

Todo.prototype.init = function() {

    function initToken() {
        const token = localStorage.getItem('token');
        if(token) {
            this.loginForm.classList.add('hidden');
            this.createForm.classList.remove('hidden');
        } else {
            this.loginForm.classList.remove('hidden');
            this.createForm.classList.add('hidden');
        }
    }

    const url = 'https://todo.hillel.it/auth/login';

    this.loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const loginFormData = new FormData(e.currentTarget);
        const loginFormDataRow = {
            value: ''
        };

        loginFormData.forEach((value) => {
            loginFormDataRow.value += value;
        });

        this.spinner.removeAttribute('hidden');

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginFormDataRow)
        })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('token', data.access_token);
                initToken();
            });

    });


    this.createForm.addEventListener('submit', e => {
        e.preventDefault();
        const dataRow = new FormData(e.target);
        const value = dataRow.get('value');
        this.append(value);
        this.render();
    });

    this.list.addEventListener('click', e => {
        const isCompleteBtn = e.target.tagName === 'BUTTON' && e.target.classList.contains('note__button--done');
        const isEditBtn = e.target.tagName === 'BUTTON' && e.target.classList.contains('note__button--edit');
        const currentNoteId = e.target.closest('.note__item').dataset.id;
        const currentNoteItemValue = e.target.closest('.note__item').querySelector('.note__text').textContent;
        console.log(currentNoteItemValue);

        if(isCompleteBtn) {
            this.complete(currentNoteId);
        } else if(isEditBtn) {
            this.editForm.style.display = 'block';
            this.editForm.style.left = e.target.offsetLeft + 'px';
            this.editForm.style.top = e.target.offsetTop + 'px';
            this.editForm.setAttribute('data-id', currentNoteId);
            this.editForm.querySelector('[name="edit-value"]').value = currentNoteItemValue;
        } else {
            this.remove(currentNoteId);
        }

        this.render();
    });

    this.editForm.addEventListener('submit', e => {
        e.preventDefault();

        const editDataRow = new FormData(e.target);
        const id = e.target.dataset.id; // eslint-disable-line
        const editData = editDataRow.get('edit-value');
        e.target.style.display = 'none';

        this.edit(id, editData);

    });

    initToken();
    this.render();
};

Todo.prototype.append = function(value) {
    const todoPost = 'https://todo.hillel.it/todo';

    fetch(todoPost, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            value: value,
            priority: 1
        })
    })
        .then(response => response.json())
        .then(() => {
            this.render();
        });
};

Todo.prototype.edit = function(id, value) {
    const editTodo = `https://todo.hillel.it/todo/${id}`;
    fetch(editTodo, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            value: value,
            priority: 1
        })
    })
        .then(response => response.json())
        .then(() => {
            this.render();
        });


};

Todo.prototype.complete = function(id) {
    const editTodo = `https://todo.hillel.it/todo/${id}/toggle`;
    fetch(editTodo, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({
            priority: 1
        })
    })
        .then(response => response.json())
        .then(() => {
            this.render();
        });
};

Todo.prototype.remove = function(id) {
    const editTodo = `https://todo.hillel.it/todo/${id}`;
    fetch(editTodo, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(() => {
            this.render();
        });


};

const todo = new Todo(
    'todo',
    document.querySelector('#loginForm'),
    document.querySelector('#createForm'),
    document.querySelector('.note'),
    document.querySelector('.edit-form'),
    note => `<li data-id="${note._id}" class="note__item${note.checked ? ' note__item--completed' : ''}">
                <span class="note__text">${note.value}</span>
                <button class="note__button note__button--done" ${note.checked ? 'disabled' : ''}>Done</button>
                <button class="note__button note__button--edit" ${note.checked ? 'disabled' : ''}>Edit</button>
                <button class="note__button note__button--remove">Remove</button>
            </li>`,
    document.querySelector('.spinner')
);

todo.init();