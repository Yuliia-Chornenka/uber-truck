/* eslint-disable max-len */
class OrderForm {
  constructor() {
  }

  render(container) {
    const orderWrapper = document.getElementsByClassName('order')[0];

    orderWrapper.innerHTML = `<p class="order-title">Create an order:</p>
                    <form class="order-form">
                        <input id="order-width" class="input input-order" 
                        placeholder="Enter width, cm*" type="number" required>
                        <input id="order-height" class="input input-order" 
                        placeholder="Enter height, cm*" type="number" required>
                        <input id="order-length" class="input input-order" 
                        placeholder="Enter length, cm*" type="number" required>
                        <input id="order-weight" class="input input-order" 
                        placeholder="Enter weight, cm*" type="number" required>
                        <input type="submit" value="Create" 
                        class="btn btn-create-order">
                    </form>
                    <p class="error-message error-order-validation">Please enter a positive number.</p>
                    <label for="select-status" class="select-status-label">Filter by status:</label>
                     <select class="select-status" id="select-status">
                        <option value="ALL" class="option-status">ALL</option>
                        <option value="NEW" class="option-status">NEW</option>
                        <option value="POSTED" class="option-status">POSTED</option>
                        <option value="ASSIGNED" class="option-status">ASSIGNED</option>
                         <option value="SHIPPED" class="option-status">SHIPPED</option>
                      </select>
                    <div class="created-load-container"></div>`;

    container.appendChild(orderWrapper);
  }
}


class createdLoad {
  constructor(width, height, length, weight, status, state, loadId) {
    this._width = width;
    this._height = height;
    this._length = length;
    this._weight = weight;
    this._status = status;
    this._state = state;
    this._loadId = loadId;
  }

  render(container) {
    const createdLoad = document.createElement('div');
    createdLoad.classList.add('created-load');
    createdLoad.id = this._loadId;

    createdLoad.innerHTML = `<p class="error-message error-message__no-truck">
            Sorry, there is no free truck now. Try again in a few minutes.</p>
        <div class="created-load__dimensions">
          <p class="created-load__item created-load__dimensions-item">
           Width: <span class="created-load__width">${this._width}</span></p>
          <p class="created-load__item created-load__dimensions-item">
           Height: <span class="created-load__height">${this._height}</span></p>
          <p class="created-load__item created-load__dimensions-item">
          Length: <span class="created-load__length">${this._length}</span></p>
          <p class="created-load__item created-load__dimensions-item">
          Weight: <span class="created-load__weight">${this._weight}</span></p>
       </div>
        <p class="created-load__item">Status: 
        <span class="created-load-status">${this._status}</span></p>
        <p class="created-load__item">State: 
        <span class="created-load-state">${this._state}</span></p>
        <button class="btn btn-post-load">Post a load</button>
        <button class="btn btn-update-load">Update a load</button>
        <button class="btn btn-delete-load">Delete a load</button>
        <button class="btn btn-create-pdf">Generate reports in PDF</button>`;

    container.appendChild(createdLoad);
  }
}


/*   Shipper create an order   */
function createOrder() {
  const orderForm = document.getElementsByClassName('order-form')[0];
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    /* To hide errors, if there were before */
    const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
    const errorOrderValidation = document.getElementsByClassName('error-order-validation')[0];
    errorOrderValidation.style.visibility = 'hidden';
    errorMessageUserPage.style.visibility = 'hidden';

    const orderContainer = document.getElementsByClassName('created-load-container')[0];

    const width = document.getElementById('order-width').value;
    const height = document.getElementById('order-height').value;
    const length = document.getElementById('order-length').value;
    const weight = document.getElementById('order-weight').value;

    const load = {
      createdTime: Date.now(),
      assignedTo: null,
      truckId: null,
      status: 'NEW',
      state: '',
      payload: weight,
      dimensions: {
        width,
        height,
        length,
      },
      logs: [],
    };

    const loadOptions = {
      method: 'POST',
      url: 'http://localhost:5000/api/loads',
      data: JSON.stringify(load),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${window.localStorage.jwtToken}`,
      },
    };

    axios(loadOptions)
        .then(function(response) {
          if (response.status === 200) {
            const newLoad = new createdLoad(response.data.dimensions.width,
                response.data.dimensions.height,
                response.data.dimensions.length, response.data.payload,
                'NEW', '', response.data._id);
            newLoad.render(orderContainer);

            orderForm.reset();

            const container = document.getElementsByClassName('created-load-container')[0];
            container.style.display = 'flex';
            container.style.flexDirection = 'column-reverse';

            /*   DELETE (delete a load with status 'NEW')  */
            deleteLoad();

            /*   UPDATE (update a load with status 'NEW')  */
            updateLoad();

            /*   Shipper post a load   */
            postLoad();
          }
        })
        .catch(function(error) {
          errorMessageUserPage.style.visibility = 'visible';
          if (error.response.status === 400) {
            errorOrderValidation.style.visibility = 'visible';
            errorMessageUserPage.style.visibility = 'hidden';
          }
        });
  });
}


/*  Actions, when successful response was got to GET loads (for a shipper)  */
function successfulResponseLoads(responseElements, orderContainer) {
  responseElements.forEach((element) => {
    const newLoad = new createdLoad(element.dimensions.width,
        element.dimensions.height, element.dimensions.length,
        element.payload, element.status, element.state, element._id);
    newLoad.render(orderContainer);
  });

  const loadStatus = Array.from(document.getElementsByClassName('created-load-status'));
  loadStatus.forEach( (status)=> {
    const btnPostLoad = status.closest('.created-load').getElementsByClassName('btn-post-load')[0];
    const btnUpdateLoad = status.closest('.created-load').getElementsByClassName('btn-update-load')[0];
    const btnDeleteLoad = status.closest('.created-load').getElementsByClassName('btn-delete-load')[0];

    if (status.innerText === 'ASSIGNED') {
      btnPostLoad.style.display = 'none';
      btnUpdateLoad.style.display = 'none';
      btnDeleteLoad.style.display = 'none';
    } else if (status.innerText === 'SHIPPED') {
      btnPostLoad.style.display = 'none';
      btnUpdateLoad.style.display = 'none';
      btnDeleteLoad.style.display = 'none';
      status.closest('.created-load').getElementsByClassName('btn-create-pdf')[0].style.display = 'block';
      status.closest('.created-load').style.backgroundColor = '#D3D3D3';
    }
  });

  /*   DELETE (delete a load with status 'NEW')  */
  deleteLoad();

  /*   UPDATE (update a load with status 'NEW')  */
  updateLoad();

  /*   Shipper post a load   */
  postLoad();

  /*   Shipper can download details in PDF   */
  downloadPdf();
}


/*  Pagination for loads  (shipper)  */
function paginateLoads(totalPages, containerForPages, endPoint) {
  const container = document.getElementsByClassName(containerForPages)[0];
  const pagesWrapper = document.createElement('div');
  pagesWrapper.classList.add('pagination-wrapper');
  for (let i=1; i<=totalPages; i++) {
    const page = document.createElement('input');
    page.type = 'radio';
    page.value = i;
    page.name = 'pagination-radio';
    page.classList.add('pagination-radio');
    page.id = `page-radio-${i}`;

    const labelRadio = document.createElement('label');
    labelRadio.htmlFor = `page-radio-${i}`;
    labelRadio.innerText = i;
    labelRadio.classList.add('pagination-radio-label');
    pagesWrapper.appendChild(page);
    pagesWrapper.appendChild(labelRadio);
    container.appendChild(pagesWrapper);
  }

  const pageRadio = Array.from(document.getElementsByClassName('pagination-radio'));
  pageRadio.forEach((page) => {
    page.addEventListener('change', () => {
      const container = document.getElementsByClassName('created-load-container')[0];
      container.style.display = 'flex';
      container.style.flexDirection = 'column';

      const getLoads = {
        method: 'GET',
        url: `http://localhost:5000/api/loads/${page.value}/3/${endPoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.jwtToken}`,
        },
      };

      axios(getLoads)
          .then(function(response) {
            const orderContainer = document.getElementsByClassName('created-load-container')[0];
            orderContainer.innerText = '';

            successfulResponseLoads(response.data.docs, orderContainer);
          })
          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    });
  });
}


/*   GET (information from database about loads)  */
function getLoads() {
  const getLoads = {
    method: 'GET',
    url: 'http://localhost:5000/api/loads/1/3',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.localStorage.jwtToken}`,
    },
  };

  axios(getLoads)
      .then(function(response) {
        const orderContainer = document.getElementsByClassName('created-load-container')[0];
        successfulResponseLoads(response.data.docs, orderContainer);

        paginateLoads(response.data.totalPages, 'order', '');
        const firstPageRadio = document.getElementById('page-radio-1');
        firstPageRadio.checked = true;
      })
      .catch(function(error) {
        const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
        errorMessageUserPage.style.visibility = 'visible';
      });
}


/*  Filter by load status */
function filterStatus() {
  const statusSelection = document.getElementById('select-status');
  statusSelection.addEventListener('change', function() {
    const orderContainer = document.getElementsByClassName('created-load-container')[0];
    const pagesWrapper = document.getElementsByClassName('pagination-wrapper')[0];
    const selectedStatus = this.value;

    if (selectedStatus === 'ALL') {
      orderContainer.innerHTML = '';
      pagesWrapper.remove();

      getLoads();
    } else {
      const getOrder = {
        method: 'GET',
        url: `http://localhost:5000/api/loads/1/3/${selectedStatus}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.jwtToken}`,
        },
      };

      axios(getOrder)
          .then(function(response) {
            orderContainer.innerText = '';
            successfulResponseLoads(response.data.docs, orderContainer);

            pagesWrapper.remove();

            paginateLoads(response.data.totalPages, 'order', selectedStatus);
            const firstPageRadio = document.getElementById('page-radio-1');
            firstPageRadio.checked = true;
          })
          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    }
  });
}


/*   DELETE (delete a load with status 'NEW')  */
function deleteLoad() {
  const deleteLoadBtn = document.getElementsByClassName(' btn-delete-load');
  const arrayDeleteBtn = Array.from(deleteLoadBtn);
  arrayDeleteBtn.forEach((button) => {
    button.addEventListener('click', () => {
      const loadId = button.parentElement.id;
      const loadOptions = {
        method: 'DELETE',
        url: `http://localhost:5000/api/loads/${loadId}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${window.localStorage.jwtToken}`,
        },
      };

      axios(loadOptions)
          .then(function(response) {
            button.parentElement.remove();
          })
          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    });
  });
}


/*   UPDATE (update a load with status 'NEW')  */
function updateLoad() {
  const updateLoadBtn = document.getElementsByClassName(' btn-update-load');
  const arrayUpdateBtn = Array.from(updateLoadBtn);
  arrayUpdateBtn.forEach((button) => {
    button.addEventListener('click', () => {
      const loadId = button.parentElement.id;

      /*  Open modal window  */
      const modalUpdateLoad = document.getElementById('modal-update-load');
      modalUpdateLoad.showModal();

      const closeUpdateLoad = document.getElementById('close-update-load');
      closeUpdateLoad.addEventListener('click', () => {
        modalUpdateLoad.close();
      });

      /* So that the values in the modal window are equal to load values,
      which is going to be updated */
      const oldWidth = button.parentElement.getElementsByClassName('created-load__width')[0];
      const oldHeight = button.parentElement.getElementsByClassName('created-load__height')[0];
      const oldLength = button.parentElement.getElementsByClassName('created-load__length')[0];
      const oldWeight = button.parentElement.getElementsByClassName('created-load__weight')[0];

      const updateWidth = document.getElementById('update-width');
      const updateHeight = document.getElementById('update-height');
      const updateLength = document.getElementById('update-length');
      const updateWeight = document.getElementById('update-weight');

      updateWidth.value = oldWidth.innerText;
      updateHeight.value = oldHeight.innerText;
      updateLength.value = oldLength.innerText;
      updateWeight.value = oldWeight.innerText;

      /*   Submit updating   */
      const updateLoadForm = document.getElementById('update-load-form');
      updateLoadForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const data = {
          width: updateWidth.value,
          height: updateHeight.value,
          length: updateLength.value,
          weight: updateWeight.value,
        };

        const loadOptions = {
          method: 'PATCH',
          url: `http://localhost:5000/api/loads/${loadId}`,
          data: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${window.localStorage.jwtToken}`,
          },
        };

        axios(loadOptions)
            .then(function(response) {
              if (response.status === 200) {
                oldWidth.innerText = response.data.dimensions.width;
                oldHeight.innerText = response.data.dimensions.height;
                oldLength.innerText = response.data.dimensions.length;
                oldWeight.innerText = response.data.payload;

                modalUpdateLoad.close();
              }
            })
            .catch(function(error) {
              const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
              errorMessageUserPage.style.visibility = 'visible';
            });
      });
    });
  });
}


function changeStatusNewPosted(oldStatus, newStatus, elementStatus, orderId, elementError, logsMessage) {
  const changeStatus = {
    status: newStatus,
    state: '',
    assignedTo: null,
    truckId: null,
    truckStatus: null,
    logsMessage: logsMessage,
    logsTime: Date.now(),
  };

  const changeStatusOptions = {
    method: 'PATCH',
    url: `http://localhost:5000/api/orders/${orderId}`,
    data: JSON.stringify(changeStatus),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${window.localStorage.jwtToken}`,
    },
  };

  axios(changeStatusOptions)
      .then(function(response) {
        if (response.status === 200) {
          elementStatus.innerText = newStatus;
        }
      })
      .catch(function(error) {
        elementStatus.innerText = oldStatus;
        elementError.style.visibility = 'visible';
      });
}

/*   Shipper post a load   */
function postLoad() {
  const postLoadBtn = document.getElementsByClassName('btn-post-load');
  const arrayPostBtn = Array.from(postLoadBtn);
  arrayPostBtn.forEach((button) => {
    button.addEventListener('click', () => {
      const orderId = button.parentElement.id;

      const state = button.parentElement.getElementsByClassName('created-load-state')[0];
      const status = button.parentElement.getElementsByClassName('created-load-status')[0];

      /*  To hide an error message, if it was before   */
      const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
      errorMessageUserPage.style.visibility = 'hidden';
      const errorMessageNoTruck = button.parentElement.getElementsByClassName('error-message__no-truck')[0];
      errorMessageNoTruck.style.visibility = 'hidden';

      /*   To change status to 'POSTED' in Database   */
      changeStatusNewPosted('NEW', 'POSTED', status, orderId, errorMessageUserPage, 'The load was posted, status changed from "NEW" to "POSTED"');

      /*  To hide buttons update/delete, when shipper post a load   */
      const btnUpdate = button.parentElement.getElementsByClassName('btn-update-load')[0];
      const btnDelete = button.parentElement.getElementsByClassName('btn-delete-load')[0];
      const btnPostLoad = button.parentElement.getElementsByClassName('btn-post-load')[0];
      btnUpdate.style.visibility = 'hidden';
      btnDelete.style.visibility = 'hidden';
      btnPostLoad.style.visibility = 'hidden';

      const width = button.parentElement.getElementsByClassName('created-load__width')[0].innerText;
      const height = button.parentElement.getElementsByClassName('created-load__height')[0].innerText;
      const length = button.parentElement.getElementsByClassName('created-load__length')[0].innerText;
      const weight = button.parentElement.getElementsByClassName('created-load__weight')[0].innerText;

      const data = {
        width,
        height,
        length,
        weight,
      };

      /*   Searching for a truck   */
      const loadOptions = {
        method: 'POST',
        url: `http://localhost:5000/api/orders`,
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${window.localStorage.jwtToken}`,
        },
      };

      axios(loadOptions)
          .then(function(response) {
            /*   If the truck was found   */
            if (response.status === 200) {
              const data = {
                status: 'ASSIGNED',
                state: 'En route to Pick Up',
                assignedTo: response.data.assignedTo,
                truckId: response.data._id,
                truckStatus: 'OL',
                logsMessage: 'The truck was found, load status changed from "POSTED" to "ASSIGNED". Load state changed to "En route to Pick Up". Truck status changed from "IS" to "OL"',
                logsTime: Date.now(),
              };

              const orderOptions = {
                method: 'PATCH',
                url: `http://localhost:5000/api/orders/${orderId}`,
                data: JSON.stringify(data),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `JWT ${window.localStorage.jwtToken}`,
                },
              };

              axios(orderOptions)
                  .then(function(response) {
                    if (response.status === 200) {
                      status.innerText = 'ASSIGNED';
                      state.innerText = 'En route to Pick Up';
                    }
                  })
                  .catch(function(error) {
                    /*   To change status to 'NEW' in Database   */
                    changeStatusNewPosted('NEW', 'NEW', status, orderId, errorMessageUserPage, 'Driver was found, but system couldn\'t change information in database because of the server error. Load status rolled back to "NEW"');
                    /*  To display buttons update/delete/post again   */
                    btnUpdate.style.visibility = 'visible';
                    btnDelete.style.visibility = 'visible';
                    btnPostLoad.style.visibility = 'visible';

                    errorMessageUserPage.style.visibility = 'visible';
                    if (error.response.status === 404) {
                      errorMessageNoTruck.style.visibility = 'visible';
                      errorMessageUserPage.style.visibility = 'hidden';
                    }
                  });
            }
          })
      /*   If the truck was NOT found   */
          .catch(function(error) {
            /*   To change status to 'NEW' in Database   */
            changeStatusNewPosted('NEW', 'NEW', status, orderId, errorMessageUserPage, 'Driver wasn\'t found, load status rolled back to "NEW"');
            /*  To display buttons update/delete/post again   */
            btnUpdate.style.visibility = 'visible';
            btnDelete.style.visibility = 'visible';
            btnPostLoad.style.visibility = 'visible';

            errorMessageUserPage.style.visibility = 'visible';
            if (error.response.status === 404) {
              errorMessageNoTruck.style.visibility = 'visible';
              errorMessageUserPage.style.visibility = 'hidden';
            }
          });
    });
  });
}


class Truck {
  constructor(type, img, dimensionsWeight, radioId) {
    this._type = type;
    this._img = img;
    this._dimensionsWeight = dimensionsWeight;
    this._radioId = radioId;
  }

  render(container) {
    const trucksWrapper = document.getElementsByClassName('trucks')[0];

    const truckContainer = document.createElement('div');
    truckContainer.classList.add('truck-container');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = this._type.toLowerCase().split(' ').join('-');
    checkbox.classList.add('checkbox-truck');

    const img = document.createElement('img');
    img.classList.add('truck__img');
    img.src = this._img;
    img.alt = this._type;

    const name = document.createElement('p');
    name.classList.add('truck__name');
    name.innerText = this._type;

    const dimensions = document.createElement('p');
    dimensions.classList.add('truck__dimensions');
    dimensions.innerText = this._dimensionsWeight;

    const btnAssign = document.createElement('input');
    btnAssign.type = 'checkbox';
    btnAssign.value = this._type.toLowerCase().split(' ').join('-');
    btnAssign.id = this._radioId;
    btnAssign.classList.add('radio-assign-btn');

    const labelAssign = document.createElement('label');
    labelAssign.htmlFor = this._radioId;
    labelAssign.innerText = 'Assign';
    labelAssign.classList.add('btn');
    labelAssign.classList.add('assign-btn');

    truckContainer.appendChild(checkbox);
    truckContainer.appendChild(img);
    truckContainer.appendChild(name);
    truckContainer.appendChild(dimensions);
    truckContainer.appendChild(btnAssign);
    truckContainer.appendChild(labelAssign);

    trucksWrapper.appendChild(truckContainer);

    container.appendChild(trucksWrapper);
  }
}


class createdOrder {
  constructor(width, height, length, weight, status, loadId) {
    this._width = width;
    this._height = height;
    this._length = length;
    this._weight = weight;
    this._status = status;
    this._loadId = loadId;
  }

  render(container) {
    const createdLoad = document.createElement('div');
    createdLoad.classList.add('created-load');
    createdLoad.id = this._loadId;

    createdLoad.innerHTML = `<div class="created-load__dimensions">
          <p class="created-load__item created-load__dimensions-item">
           Width: <span class="created-load__width">${this._width}</span></p>
          <p class="created-load__item created-load__dimensions-item">
           Height: <span class="created-load__height">${this._height}</span></p>
          <p class="created-load__item created-load__dimensions-item">
          Length: <span class="created-load__length">${this._length}</span></p>
          <p class="created-load__item created-load__dimensions-item">
          Weight: <span class="created-load__weight">${this._weight}</span></p>
       </div>
        <p class="created-load__item">Status: 
        <span class="created-load-status">${this._status}</span></p>
        <p class="created-load__item">State: 
        <select class="select-state">
           <option value="En route to Pick Up" class="option-state">En route to Pick Up</option>
           <option value="Arrived to Pick Up" class="option-state">Arrived to Pick Up</option>
           <option value="En route to delivery" class="option-state">En route to delivery</option>
           <option value="Arrived to delivery" class="option-state">Arrived to delivery</option>
        </select>`;

    container.appendChild(createdLoad);
  }
}


/*  Change state (PATCH), when driver select an option */
function changeState() {
  const stateSelection = Array.from(document.getElementsByClassName('select-state'));
  stateSelection.forEach((element) => {
    element.addEventListener('change', function() {
      const orderState = this.value;
      const orderId = element.closest('.created-load').id;
      /*  To find an order with which a driver is working now*/
      const getOrder = {
        method: 'GET',
        url: `http://localhost:5000/api/orders/${orderId}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.jwtToken}`,
        },
      };

      axios(getOrder)
          .then(function(response) {
            /* (PATCH) When an order is found, then we change it's status/state and truck status due to driver's selection */
            if (response.status === 200) {
              const data = {
                status: 'ASSIGNED',
                state: orderState,
                assignedTo: response.data.assignedTo,
                truckId: response.data.truckId,
                truckStatus: 'OL',
                logsMessage: `Load state was changed to "${orderState}" by driver.`,
                logsTime: Date.now(),
              };

              if (orderState === 'Arrived to delivery') {
                data.status = 'SHIPPED';
                data.truckStatus = 'IS';
                data.logsMessage = `Load state was changed to "${orderState}" by driver. Load status changed from "ASSIGNED" to "SHIPPED". Truck status changed from "OL" to "IS"`;
                /*  So that the driver can change profile information once he select 'Arrived to delivery' */
                allowChanging();
              } else if (orderState === 'En route to Pick Up' || 'Arrived to Pick Up' || 'En route to delivery') {
                data.status = 'ASSIGNED';
                data.truckStatus = 'OL';
              }

              const orderOptions = {
                method: 'PATCH',
                url: `http://localhost:5000/api/orders/${orderId}`,
                data: JSON.stringify(data),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `JWT ${window.localStorage.jwtToken}`,
                },
              };

              axios(orderOptions)
                  .then(function(response) {
                    if (response.status === 200) {
                      if (response.data.status === 'SHIPPED') {
                        const orderContainer = element.closest('.created-load');
                        orderContainer.style.backgroundColor = '#D3D3D3';
                        orderContainer.getElementsByClassName('created-load-status')[0].innerText = 'SHIPPED';

                        const newStatus = document.createElement('span');
                        newStatus.innerText = 'Arrived to delivery';
                        const parent = element.parentElement;
                        parent.replaceChild(newStatus, element);

                        const btnDownload = document.createElement('button');
                        btnDownload.classList.add('btn');
                        btnDownload.classList.add('btn-create-pdf');
                        btnDownload.innerText = 'Generate reports in PDF';
                        btnDownload.style.display = 'block';
                        orderContainer.appendChild(btnDownload);

                        /*   Driver can download details in PDF   */
                        downloadPdf();
                      }
                    }
                  })
                  .catch(function(error) {
                    const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
                    errorMessageUserPage.style.visibility = 'visible';
                  });
            }
          })
          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    });
  });
}


/*  Actions, when successful response was got to GET orders (for a driver)  */
function successfulResponseOrders(responseElements, orderContainer) {
  /*   To render all driver's orders    */
  responseElements.forEach((element) => {
    const newOrder = new createdOrder(element.dimensions.width,
        element.dimensions.height, element.dimensions.length,
        element.payload, element.status, element._id);
    newOrder.render(orderContainer);

    /*  To hide selection/display button 'download', if order has already been shipped  */
    if (element.status === 'SHIPPED') {
      const orderContainer = document.getElementById(element._id);
      orderContainer.style.backgroundColor = '#D3D3D3';
      const btnDownload = document.createElement('button');
      btnDownload.classList.add('btn');
      btnDownload.classList.add('btn-create-pdf');
      btnDownload.innerText = 'Generate reports in PDF';
      btnDownload.style.display = 'block';
      orderContainer.appendChild(btnDownload);

      const selectParent = orderContainer.getElementsByClassName('created-load__item')[5];
      const select = selectParent.getElementsByClassName('select-state')[0];
      const newStatus = document.createElement('span');
      newStatus.innerText = 'Arrived to delivery';
      selectParent.replaceChild(newStatus, select);
    } else {
      const select = document.getElementsByClassName('select-state')[0];
      select.value = element.state;
      /*  So that the driver can not change any information while he is on a load  */
      preventChanging();
    }
  });
  /*  Change state (PATCH), when driver select an option */
  changeState();

  /*   Driver can download details in PDF   */
  downloadPdf();
}


/*  Pagination for orders  (driver)  */
function paginateOrders(totalPages, containerForPages, endPoint) {
  const container = document.getElementsByClassName(containerForPages)[0];
  const pagesWrapper = document.createElement('div');
  pagesWrapper.classList.add('pagination-wrapper');
  for (let i=1; i<=totalPages; i++) {
    const page = document.createElement('input');
    page.type = 'radio';
    page.value = i;
    page.name = 'pagination-radio';
    page.classList.add('pagination-radio');
    page.id = `page-radio-${i}`;

    const labelRadio = document.createElement('label');
    labelRadio.htmlFor = `page-radio-${i}`;
    labelRadio.innerText = i;
    labelRadio.classList.add('pagination-radio-label');
    pagesWrapper.appendChild(page);
    pagesWrapper.appendChild(labelRadio);
    container.appendChild(pagesWrapper);
  }

  const pageRadio = Array.from(document.getElementsByClassName('pagination-radio'));
  pageRadio.forEach((page) => {
    page.addEventListener('change', () => {
      const getLoads = {
        method: 'GET',
        url: `http://localhost:5000/api/orders/${page.value}/3/${endPoint}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.jwtToken}`,
        },
      };

      axios(getLoads)
          .then(function(response) {
            const orderContainer = document.getElementsByClassName('order-container')[0];
            orderContainer.innerText = '';

            successfulResponseOrders(response.data.docs, orderContainer);
          })
          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    });
  });
}


function createOrderContainer() {
  const orderContainer = document.createElement('div');
  orderContainer.classList.add('order-container');
  const orderTitle = document.createElement('p');
  orderTitle.classList.add('driver-order-title');
  orderTitle.innerText = 'Your orders:';
  const selectStatus = document.createElement('select');
  selectStatus.classList.add('select-status');
  selectStatus.id = 'select-status';
  selectStatus.innerHTML = `<option value="ALL" class="option-status">ALL</option>
          <option value="ASSIGNED" class="option-status">ASSIGNED</option>
          <option value="SHIPPED" class="option-status">SHIPPED</option>`;
  const label = document.createElement('label');
  label.classList.add('select-status-label');
  label.htmlFor = 'select-status';
  label.innerText = 'Filter by status:';

  const trucksContainer = document.getElementsByClassName('trucks')[0];
  trucksContainer.after(orderContainer);
  trucksContainer.after(selectStatus);
  trucksContainer.after(orderTitle);
  selectStatus.before(label);
}

/*   GET (information from database about driver's orders)  */
function getOrders() {
  const getOrders = {
    method: 'GET',
    url: 'http://localhost:5000/api/orders/1/3',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.localStorage.jwtToken}`,
    },
  };

  axios(getOrders)
      .then(function(response) {
        const orderContainer = document.getElementsByClassName('order-container')[0];
        /*  Actions, when successful response was got to GET orders (for a driver)  */
        successfulResponseOrders(response.data.docs, orderContainer);

        /*  Pagination for orders  (driver)  */
        paginateOrders(response.data.totalPages, 'user-order-panel', '');
        const firstPageRadio = document.getElementById('page-radio-1');
        firstPageRadio.checked = true;
      })
      .catch(function(error) {
        const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
        errorMessageUserPage.style.visibility = 'visible';
      });
}


/*  Filter by order status */
function filterStatusOrder() {
  const statusSelection = document.getElementById('select-status');
  statusSelection.addEventListener('change', function() {
    const orderContainer = document.getElementsByClassName('order-container')[0];
    const pagesWrapper = document.getElementsByClassName('pagination-wrapper')[0];
    const selectedStatus = this.value;

    if (selectedStatus === 'ALL') {
      orderContainer.innerText = '';
      pagesWrapper.remove();

      getOrders();
    } else {
      const getOrder = {
        method: 'GET',
        url: `http://localhost:5000/api/orders/1/3/${selectedStatus}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.jwtToken}`,
        },
      };

      axios(getOrder)
          .then(function(response) {
            orderContainer.innerText = '';
            successfulResponseOrders(response.data.docs, orderContainer);

            pagesWrapper.remove();

            /*  Pagination for orders  (driver)  */
            paginateOrders(response.data.totalPages, 'user-order-panel', selectedStatus);
            const firstPageRadio = document.getElementById('page-radio-1');
            firstPageRadio.checked = true;
          })
          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    }
  });
}


/*  So that the driver can not change any information while he is on a load  */
function preventChanging() {
  const buttons = Array.from(document.getElementsByTagName('button'));
  buttons.forEach((item) => {
    item.disabled = true;
  });
  const checkboxes = Array.from(document.getElementsByTagName('input'));
  checkboxes.forEach((item) => {
    item.disabled = item.type !== 'radio';
  });
}

/*  So that the driver can change profile information once he select 'Arrived to delivery' */
function allowChanging() {
  const buttons = Array.from(document.getElementsByTagName('button'));
  buttons.forEach((item) => {
    item.disabled = false;
  });
  const checkboxes = Array.from(document.getElementsByTagName('input'));
  checkboxes.forEach((item) => {
    item.disabled = false;
  });
}


/*   Add/Delete a truck using checkbox   */
function addDeleteTruck() {
  const checkboxTruck = document.getElementsByClassName('checkbox-truck');
  const arrayCheckboxTruck = Array.from(checkboxTruck);
  arrayCheckboxTruck.forEach((item) => {
    item.addEventListener('change', () => {
      if (item.checked) {
        let width;
        let height;
        let length;
        let weight;

        if (item.id === 'sprinter') {
          width = 170;
          height = 250;
          length = 300;
          weight = 1700;
        } else if (item.id === 'small-straight') {
          width = 170;
          height = 250;
          length = 500;
          weight = 2500;
        } else if (item.id === 'large-straight') {
          width = 200;
          height = 350;
          length = 700;
          weight = 4000;
        }

        const truck = {
          assignedTo: null,
          status: 'IS',
          type: item.id,
          sizes: {
            width,
            height,
            length,
            weight,
          },
        };

        const truckOptions = {
          method: 'POST',
          url: 'http://localhost:5000/api/trucks',
          data: JSON.stringify(truck),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${window.localStorage.jwtToken}`,
          },
        };

        axios(truckOptions)
            .then(function(response) {
              if (response.status === 200) {
                item.checked = true;
                item.parentElement.style.backgroundColor = '#34D0B6';
                /* To display button 'assign'  */
                item.parentElement.children[5].style.display = 'block';


                /* So that button 'assign' wouldn't  appear when you
                create a truck, but other truck is already assigned.
                But appear only when no truck is assigned */
                const checkboxAssignTruck = document.getElementsByClassName('radio-assign-btn');
                const arrayCheckboxAssignTruck = Array.from(checkboxAssignTruck);
                arrayCheckboxAssignTruck.forEach((element) => {
                  if (element.checked) {
                    /* To display button 'assign'  */
                    element.parentElement.children[5].style.display = 'block';
                    /* To hide other buttons 'assign'  */
                    item.parentElement.children[5].style.display = 'none';
                  }
                });
              }
            })
            .catch(function(error) {
              item.checked = false;
              item.parentElement.style.backgroundColor = 'transparent';
              /* To hide button 'assign'  */
              item.parentElement.children[5].style.display = 'none';

              const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
              errorMessageUserPage.style.visibility = 'visible';
            });
      } else {
        const truckOptions = {
          method: 'DELETE',
          url: `http://localhost:5000/api/trucks/${item.id}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${window.localStorage.jwtToken}`,
          },
        };

        axios(truckOptions)
            .then(function(response) {
              item.checked = false;
              item.parentElement.style.backgroundColor = 'transparent';
              /* To hide button 'assign'  */
              item.parentElement.children[5].style.display = 'none';
            })
            .catch(function(error) {
              item.checked = true;
              item.parentElement.style.backgroundColor = '#34D0B6';
              /* To display button 'assign'  */
              item.parentElement.children[5].style.display = 'block';

              const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
              errorMessageUserPage.style.visibility = 'visible';
            });
      }
    });
  });
}


/*   GET (information from database about trucks)  */
function getTrucks() {
  const getTrucks = {
    method: 'GET',
    url: 'http://localhost:5000/api/trucks',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.localStorage.jwtToken}`,
    },
  };

  axios(getTrucks)
      .then(function(response) {
        /*  Correctly display checked trucks*/
        const checkboxTruck = document.getElementsByClassName('checkbox-truck');
        const arrayCheckboxTruck = Array.from(checkboxTruck);

        arrayCheckboxTruck.forEach((item) => {
          response.data.forEach((element) => {
            if (item.id === element.type) {
              item.checked = true;
              item.parentElement.style.backgroundColor = '#34D0B6';
              /* To display button 'assign'  */
              item.parentElement.children[5].style.display = 'block';
            }
          });
        });

        /*  Correctly display assigned truck*/
        const checkboxAssignTruck = document.getElementsByClassName('radio-assign-btn');
        const arrayCheckboxAssignTruck = Array.from(checkboxAssignTruck);

        arrayCheckboxAssignTruck.forEach((item) => {
          response.data.forEach((element) => {
            if (item.value === element.type && element.assignedTo) {
              const assignBtn = document.getElementsByClassName('radio-assign-btn');
              const arrayAssignBtn = Array.from(assignBtn);
              arrayAssignBtn.forEach((item) => {
                /* To hide all buttons 'assign'  */
                item.nextElementSibling.style.display = 'none';
              });

              item.checked = true;
              item.nextElementSibling.innerText = 'Unassign';
              /*  To hide checkbox  */
              item.parentElement.firstElementChild.style.visibility = 'hidden';
              item.parentElement.style.backgroundColor = 'grey';
              /*  To display button 'unassign'  */
              item.nextElementSibling.style.display = 'block';
            }
          });
        });
      })
      .catch(function(error) {
        const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
        errorMessageUserPage.style.visibility = 'visible';
      });
}


/*   Assign/Unassign truck on yourself   */
function assignTruck() {
  const assignBtn = document.getElementsByClassName('radio-assign-btn');
  const arrayAssignBtn = Array.from(assignBtn);
  arrayAssignBtn.forEach((button) => {
    button.addEventListener('click', (event) => {
      /*   Assign   */
      if (button.checked) {
        const truckOptions = {
          method: 'PATCH',
          url: `http://localhost:5000/api/trucks`,
          data: JSON.stringify({
            type: button.value,
            assignedTo: ' ',
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${window.localStorage.jwtToken}`,
          },
        };

        axios(truckOptions)
            .then(function(response) {
              if (response.status === 200) {
                button.checked = true;

                arrayAssignBtn.forEach((item) => {
                  /* To hide all buttons 'assign'  */
                  item.nextElementSibling.style.display = 'none';
                });
                /*  To hide checkbox  */
                button.parentElement.firstElementChild.style.visibility = 'hidden';
                button.parentElement.style.backgroundColor = 'grey';
                /*  To display button 'unassign'  */
                button.nextElementSibling.style.display = 'block';
                button.nextElementSibling.innerText = 'Unassign';

                const checkboxTruck = document.getElementsByClassName('checkbox-truck');
                const arrayCheckboxTruck = Array.from(checkboxTruck);
                arrayCheckboxTruck.forEach((item) => {
                  item.addEventListener('change', () => {
                    /* To hide button 'assign'  */
                    item.parentElement.children[5].style.display = 'none';
                  });
                });
              }
            })
            .catch(function(error) {
              button.checked = false;

              const errorMessage = document.getElementsByClassName('error-message__user-page')[0];
              errorMessage.style.visibility = 'visible';
            });

        /*   Unassign   */
      } else {
        const truckOptions = {
          method: 'PATCH',
          url: `http://localhost:5000/api/trucks`,
          data: JSON.stringify({
            type: button.value,
            assignedTo: null,
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${window.localStorage.jwtToken}`,
          },
        };

        axios(truckOptions)
            .then(function(response) {
              if (response.status === 200) {
                button.checked = false;

                const checkboxTruck = document.getElementsByClassName('checkbox-truck');
                const arrayCheckboxTruck = Array.from(checkboxTruck);
                arrayCheckboxTruck.forEach((item) => {
                  if (item.checked) {
                    /* To display button 'assign' at appropriate trucks */
                    item.parentElement.children[5].style.display = 'block';
                  }
                });

                button.parentElement.firstElementChild.style.visibility = 'visible'; /*  To display checkbox  */
                button.parentElement.style.backgroundColor = '#34D0B6';
                button.nextElementSibling.innerText = 'Assign';
              }
            })
            .catch(function(error) {
              button.checked = true;

              const errorMessage = document.getElementsByClassName('error-message__user-page')[0];
              errorMessage.style.visibility = 'visible';
            });
      }
    });
  });
}


/*   GET (all information from database about user)  */
const getUser = {
  method: 'GET',
  url: 'http://localhost:5000/api/profile',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.localStorage.jwtToken}`,
  },
};

axios(getUser)
    .then(function(response) {
      const userPhoto = document.getElementsByClassName('user__photo')[0];
      const userGreetingName = document.getElementsByClassName('user__greeting--name')[0];
      const userStatus = document.getElementsByClassName('user-status')[0];
      const userName = document.getElementsByClassName('user-name')[0];
      const userEmail = document.getElementsByClassName('user-email')[0];

      if (response.data.userPhoto) {
        userPhoto.style.backgroundImage = `url('../../uploads/${response.data.userPhoto}')`;
      } else {
        userPhoto.style.backgroundImage = `url('../img/default-user-image.png')`;
      }

      userStatus.innerText = response.data.userPosition;
      userName.innerText = response.data.username;
      userEmail.innerText = response.data.userEmail;
      userGreetingName.innerText = response.data.username;


      if (response.data.userPosition === 'Driver') {
        const userOrderPanel = document.getElementsByClassName('user-order-panel')[0];

        const Sprinter = new Truck('Sprinter', '../img/sprinter.png',
            '(300*250*170, 1700)', 'radio-sprinter');
        Sprinter.render(userOrderPanel);

        const SmallStraight = new Truck('Small Straight',
            '../img/small-straight.png', '(500*250*170, 2500)',
            'radio-small-straight');
        SmallStraight.render(userOrderPanel);

        const LargeStraight = new Truck('Large Straight',
            '../img/large-straight.png', '(700*350*200, 4000)',
            'radio-large-straight');
        LargeStraight.render(userOrderPanel);

        const truckTitle = document.getElementsByClassName('truck__title')[0];
        truckTitle.style.display = 'block';

        createOrderContainer();


        /*   GET (information from database about driver's orders */
        getOrders();

        /*   Add/Delete a truck using checkbox   */
        addDeleteTruck();

        /*   GET (information from database about trucks)  */
        getTrucks();

        /*   Assign/Unassign truck on yourself   */
        assignTruck();

        /*  Driver can filter orders by status */
        filterStatusOrder();
      } else if (response.data.userPosition === 'Shipper') {
        const userOrderPanel = document.getElementsByClassName('user-order-panel')[0];
        const newOrderForm = new OrderForm();
        newOrderForm.render(userOrderPanel);

        /*   Shipper create an order   */
        createOrder();

        /*   GET (information from database about loads)  */
        getLoads();

        /*  Shipper can filter loads by status   */
        filterStatus();
      }
    })
    .catch(function(error) {
      const errorMessage = document.getElementsByClassName('error-message')[0];
      errorMessage.style.visibility = 'visible';
      if (error.response.status === 500) {
        document.location.href = '../home/home.html';
      }
    });


/*  Sign out   */
const btnSignOut = document.getElementsByClassName('btn-sign-out')[0];
btnSignOut.addEventListener('click', () => {
  localStorage.removeItem('jwtToken');
  document.location.href = '../home/home.html';
});


/*   DELETE (delete a user account)  */
const btnDeleteAccount = document.getElementsByClassName('delete-account')[0];
btnDeleteAccount.addEventListener('click', (event) => {
  const options = {
    method: 'DELETE',
    url: `http://localhost:5000/api/profile`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${window.localStorage.jwtToken}`,
    },
  };

  axios(options)
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem('jwtToken');
          document.location.href = '../home/home.html';
        }
      })
      .catch(function(error) {
        const errorMessage = document.getElementsByClassName('error-message-delete')[0];
        errorMessage.style.visibility = 'visible';
      });
});


/*   Change account password   */
const changePassword = document.getElementsByClassName('change-password')[0];
changePassword.addEventListener('click', () => {
  const modalPassword = document.getElementById('modal-password');
  modalPassword.showModal();

  const closePassword = document.getElementById('close-password');
  closePassword.addEventListener('click', () => modalPassword.close());

  const errorPassword = document.getElementById('error-password');
  const errorMessagePassword = document.getElementById('error-message-password');
  const errorPasswordValidation = document.getElementById('error-password-validation');

  const passwordForm = document.getElementById('password-form');
  passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();

    /* To hide errors, it there were before */
    errorPassword.style.visibility = 'hidden';
    errorMessagePassword.style.visibility = 'hidden';
    errorPasswordValidation.style.visibility = 'hidden';

    const oldPassword = document.getElementById('password-old').value;
    const newPassword = document.getElementById('password-new').value;

    const passwordOptions = {
      method: 'PATCH',
      url: `http://localhost:5000/api/password`,
      data: JSON.stringify({
        oldPassword,
        password: newPassword,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${window.localStorage.jwtToken}`,
      },
    };

    axios(passwordOptions)
        .then(function(response) {
          if (response.status === 200) {
            passwordForm.reset();
            const successPassword = document.getElementsByClassName('success-password')[0];
            successPassword.style.visibility = 'visible';
          }
        })
        .catch(function(error) {
          errorMessagePassword.style.visibility = 'visible';
          errorPassword.style.visibility = 'hidden';
          errorPasswordValidation.style.visibility = 'hidden';
          if (error.response.status === 401) {
            errorPassword.style.visibility = 'visible';
            errorMessagePassword.style.visibility = 'hidden';
            errorPasswordValidation.style.visibility = 'hidden';
          }
          if (error.response.status === 400) {
            errorPasswordValidation.style.visibility = 'visible';
            errorPassword.style.visibility = 'hidden';
            errorMessagePassword.style.visibility = 'hidden';
          }
        });
  });
});


/*  Ability to change avatar for user */
const formUploadPhoto = document.getElementById('form-upload-photo');
formUploadPhoto.addEventListener('submit', (event) => {
  event.preventDefault();

  /* To hide errors if there were before */
  const errorMessage = document.getElementsByClassName('error-message__user-page')[0];
  const errorMessageAvatar = document.getElementsByClassName('error-message-avatar')[0];
  errorMessage.style.visibility = 'hidden';
  errorMessageAvatar.style.visibility = 'hidden';

  const formData = new FormData(document.forms.avatar);

  const passwordOptions = {
    method: 'PATCH',
    url: `http://localhost:5000/api/profile`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `JWT ${window.localStorage.jwtToken}`,
    },
  };

  axios(passwordOptions)
      .then(function(response) {
        const userPhoto = document.getElementsByClassName('user__photo')[0];
        userPhoto.style.backgroundImage = `url('../../uploads/${response.data}')`;
      })
      .catch(function(error) {
        errorMessage.style.visibility = 'visible';
        if (error.response.status === 413) {
          errorMessage.style.visibility = 'hidden';
          errorMessageAvatar.style.visibility = 'visible';
        }
      });
});


/*   Generate and download report about shipped loads in PDF   */
function downloadPdf() {
  const btnCreate = document.getElementsByClassName('btn-create-pdf');
  const arrayCreatedBtn = Array.from(btnCreate);
  arrayCreatedBtn.forEach((button) => {
    button.addEventListener('click', () => {
      const loadId = button.parentElement.id;
      const loadOptions = {
        method: 'GET',
        url: `http://localhost:5000/api/orders/${loadId}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${window.localStorage.jwtToken}`,
        },
      };

      axios(loadOptions)
          .then(function(response) {
            const log = response.data.logs;
            const arrayLogs = [];
            log.forEach((element) => {
              arrayLogs.push(element.time, element.message);
            });

            const stringLogs = arrayLogs.join('\n');

            const doc = new PDFDocument();
            const stream = doc.pipe(blobStream());

            doc
                .fontSize(25)
                .fill('#00A287')
                .text('Details about the order:', {
                  align: 'center',
                  underline: 'true',
                });

            doc.moveDown();
            doc
                .fontSize(14)
                .fill('black')
                .text(`Status: ${response.data.status}\n
                       Weight: ${response.data.payload} kg\n
                       Width: ${response.data.dimensions.width} cm\n
                       Height: ${response.data.dimensions.height} cm\n
                       Length: ${response.data.dimensions.length} cm\n
                       Trip details: \n
                       ${stringLogs}`,
                {
                  align: 'left',
                  lineGap: 5,
                });

            doc.end();

            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';

            let blob;

            function download() {
              if (!blob) return;
              const url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = 'Order details.pdf';
              a.click();
              window.URL.revokeObjectURL(url);
            }

            stream.on('finish', function() {
              blob = stream.toBlob('application/pdf');
            });

            const pdfIcon = button.parentElement.getElementsByClassName('pdf-icon')[0];

            if (pdfIcon) {
              button.disabled = true;
            } else {
              const btnDownload = document.createElement('img');
              btnDownload.classList.add('pdf-icon');
              btnDownload.src = '../img/pdf-icon.png';
              btnDownload.alt = 'pdf-icon';
              button.parentElement.appendChild(btnDownload);

              btnDownload.addEventListener('click', () => {
                download();
              });
            }
          })

          .catch(function(error) {
            const errorMessageUserPage = document.getElementsByClassName('error-message__user-page')[0];
            errorMessageUserPage.style.visibility = 'visible';
          });
    });
  });
}
