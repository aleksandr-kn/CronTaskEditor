class EasyHTTP {
  //Make an HTTP GET Request
  async get(url) {
    const response = await fetch(url, {
      method: "GET",
    });
    try {
      const resData = await response.json();

      return { status: response.ok, data: resData };
    } catch {
      return { status: response.ok };
    }
  }

  //Make an HTTP POST Request
  async post(url, data) {
    console.log(data);
    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    try {
      const resData = await response.json();
      return { status: response.ok, data: resData };
    } catch (error) {
      return { status: response.ok };
    }
  }

  // Make an HTTP PUT Request
  async put(url, data) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    return resData;
  }

  // Delete an HTTP Request
  async delete(url) {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
    });

    const resData = "Resource Deleted...";
    return resData;
  }
}
