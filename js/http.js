class EasyHTTP {
  //Make an HTTP GET Request
  async get(url) {
    const responce = await fetch(url);
    const resData = await responce.json();

    return { status: responce.ok, data: resData };
  }

  //Make an HTTP POST Request
  async post(url, data) {
    const responce = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: data,
    });

    try {
      const resData = await responce.json();
      return { status: responce.ok, data: resData };
    } catch (error) {
      return { status: responce.ok };
    }
  }

  // Make an HTTP PUT Request
  async put(url, data) {
    const responce = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await responce.json();
    return resData;
  }

  // Delete an HTTP Request
  async delete(url) {
    const responce = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
    });

    const resData = "Resource Deleted...";
    return resData;
  }
}
