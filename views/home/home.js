/* Local Storage (is the user already registered or not) */
window.addEventListener('load', function() {
  const profileLink = document.getElementsByClassName('header-link')[0];
  const loginBtn = document.getElementsByClassName('btn__login')[0];
  if (window.localStorage.jwtToken) {
    profileLink.style.display = 'inline-block';
    loginBtn.style.display = 'none';
    // eslint-disable-next-line max-len
    const registerBlock = Array.from(document.getElementsByClassName('register-block'));
    registerBlock.forEach((button) => {
      button.style.visibility = 'hidden';
    });
  } else {
    profileLink.style.display = 'none';
    loginBtn.style.display = 'inline-block';
  }
});


// eslint-disable-next-line max-len
const btnRegisterDriver = document.getElementsByClassName('btn__register--driver')[0];
// eslint-disable-next-line max-len
const btnRegisterShipper = document.getElementsByClassName('btn__register--shipper')[0];
const btnLogin = document.getElementsByClassName('btn__login')[0];


/*   Register driver   */
btnRegisterDriver.addEventListener('click', () => {
  const modalRegisterDriver = document.getElementById('modal-register-driver');
  modalRegisterDriver.showModal();

  const closeRegisterDriver = document.getElementById('close-register-driver');
  closeRegisterDriver.addEventListener('click', () => {
    modalRegisterDriver.close();
  });

  /*   To hide error/success messages, if they were before*/
  const successRegister = document.getElementById('success-register-driver');
  const errorRegisterDriver = document.getElementById('error-register-driver');
  const emailExistDriver = document.getElementById('email-exist-driver');
  // eslint-disable-next-line max-len
  const errorRegisterValidation = document.getElementById('error-register-driver-validation');
  successRegister.style.visibility = 'hidden';
  emailExistDriver.style.visibility = 'hidden';
  errorRegisterDriver.style.visibility = 'hidden';
  errorRegisterValidation.style.visibility = 'hidden';


  const registerFormDriver = document.getElementById('register-form-driver');
  registerFormDriver.addEventListener('submit', (event) => {
    event.preventDefault();

    /*   To hide errors messages, if they were before*/
    emailExistDriver.style.visibility = 'hidden';
    errorRegisterDriver.style.visibility = 'hidden';
    errorRegisterValidation.style.visibility = 'hidden';

    const email = document.getElementById('email-register-driver').value;
    const username = document.getElementById('name-register-driver').value;
    const password = document.getElementById('password-register-driver').value;

    const userRegister = {
      email,
      username,
      password,
      position: 'Driver',
    };

    const registerOptions = {
      method: 'POST',
      url: 'http://localhost:5000/api/register',
      data: JSON.stringify(userRegister),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    axios(registerOptions)
        .then(function(response) {
          if (response.status === 200) {
            successRegister.style.visibility = 'visible';
            emailExistDriver.style.visibility = 'hidden';
            errorRegisterDriver.style.visibility = 'hidden';
            errorRegisterValidation.style.visibility = 'hidden';
          }
        })
        .catch(function(error) {
          errorRegisterDriver.style.visibility = 'visible';
          if (error.response.status === 409) {
            emailExistDriver.style.visibility = 'visible';
            errorRegisterDriver.style.visibility = 'hidden';
          }
          if (error.response.status === 400) {
            errorRegisterValidation.style.visibility = 'visible';
            errorRegisterDriver.style.visibility = 'hidden';
          }
        });
  });
});

/*   Register shipper   */
btnRegisterShipper.addEventListener('click', () => {
  // eslint-disable-next-line max-len
  const modalRegisterShipper = document.getElementById('modal-register-shipper');
  modalRegisterShipper.showModal();

  // eslint-disable-next-line max-len
  const closeRegisterShipper = document.getElementById('close-register-shipper');
  closeRegisterShipper.addEventListener('click', () => {
    modalRegisterShipper.close();
  });

  /*   To hide error/success messages, if they were before*/
  const successRegister = document.getElementById('success-register-shipper');
  // eslint-disable-next-line max-len
  const errorRegisterShipper = document.getElementById('error-register-shipper');
  const emailExistShipper = document.getElementById('email-exist-shipper');
  // eslint-disable-next-line max-len
  const errorRegisterValidation = document.getElementById('error-register-shipper-validation');
  successRegister.style.visibility = 'hidden';
  emailExistShipper.style.visibility = 'hidden';
  errorRegisterShipper.style.visibility = 'hidden';
  errorRegisterValidation.style.visibility = 'hidden';

  const registerFormShipper = document.getElementById('register-form-shipper');
  registerFormShipper.addEventListener('submit', (event) => {
    event.preventDefault();

    /*   To hide errors messages, if they were before*/
    emailExistShipper.style.visibility = 'hidden';
    errorRegisterShipper.style.visibility = 'hidden';
    errorRegisterValidation.style.visibility = 'hidden';

    const email = document.getElementById('email-register-shipper').value;
    const username = document.getElementById('name-register-shipper').value;
    const password = document.getElementById('password-register-shipper').value;

    const userRegister = {
      email,
      username,
      password,
      position: 'Shipper',
    };

    const registerOptions = {
      method: 'POST',
      url: 'http://localhost:5000/api/register',
      data: JSON.stringify(userRegister),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    axios(registerOptions)
        .then(function(response) {
          if (response.status === 200) {
            successRegister.style.visibility = 'visible';
            emailExistShipper.style.visibility = 'hidden';
            errorRegisterShipper.style.visibility = 'hidden';
            errorRegisterValidation.style.visibility = 'hidden';
          }
        })
        .catch(function(error) {
          errorRegisterShipper.style.visibility = 'visible';
          if (error.response.status === 409) {
            emailExistShipper.style.visibility = 'visible';
            errorRegisterShipper.style.visibility = 'hidden';
          }
          if (error.response.status === 400) {
            errorRegisterValidation.style.visibility = 'visible';
            errorRegisterShipper.style.visibility = 'hidden';
          }
        });
  });
});


/*   Login    */
btnLogin.addEventListener('click', () => {
  const modalLogin = document.getElementById('modal-login');
  modalLogin.showModal();

  const closeLogin = document.getElementById('close-login');
  closeLogin.addEventListener('click', () => modalLogin.close());

  /*   To hide error messages, if they were before*/
  const errorLoginDriver = document.getElementById('error-login');
  const errorLoginDataDriver = document.getElementById('error-login-data');
  errorLoginDriver.style.visibility = 'hidden';
  errorLoginDataDriver.style.visibility = 'hidden';


  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    /*   To hide error messages, if they were before*/
    errorLoginDriver.style.visibility = 'hidden';
    errorLoginDataDriver.style.visibility = 'hidden';

    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    const userLogin = {
      email,
      password,
    };

    const loginOptions = {
      method: 'POST',
      url: 'http://localhost:5000/api/login',
      data: JSON.stringify(userLogin),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    axios(loginOptions)
        .then(function(response) {
          if (response.status === 200) {
            window.localStorage.jwtToken = response.data.token;
            document.location.href = '../profile/profile.html';
          }
        })
        .catch(function(error) {
          errorLoginDriver.style.visibility = 'visible';
          if (error.response.status === 401 || 400) {
            errorLoginDataDriver.style.visibility = 'visible';
            errorLoginDriver.style.visibility = 'hidden';
          }
        });
  });
});

