/* ---------------------------------- texto --------------------------------- */
function validarTexto(texto) {

    
}

function normalizarTexto(texto) {
    
}

/* ---------------------------------- email --------------------------------- */
function validarEmail(email) {
email.addEventListener('input', ()=>{
    let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
    if (regex.test(email)) 
    console.log("hola");

    console.log(email.value);
    
})
}

function normalizarEmail(email) {
    
}

/* -------------------------------- password -------------------------------- */
function validarContrasenia(password) {
    password.addEventListener('input',()=>{
        
        password.classList.add('erroneo')
        // si pasa las pruebas lo damos por válido 👇
        if (password.value.length > 5 && !password.value.includes(' ')) {
            password.classList.remove('erroneo')
        }
    })
}

function compararContrasenias(contrasenia_1, contrasenia_2) {
    
}

