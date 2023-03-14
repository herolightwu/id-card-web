export const cryptoURL = 'https://api.idcard.veritecinc.com';	//'http://192.168.10.121:3000';

export const serverURL = 'http://192.168.10.121:3000';
// export const serverURL = 'https://api.idcard.dev.veritecinc.com';

export const hostURL = serverURL;
export const uploadsHostUrl = serverURL
export const uploadedDirUrl = serverURL + "/uploads/"

const futch = (url, opts = {}, onProgress) => {
	// // console.log(url, opts)
	return new Promise((res, rej) => {
		var xhr = new XMLHttpRequest();
		xhr.open(opts.method || "get", url);
		for (var k in opts.headers || {}) xhr.setRequestHeader(k, opts.headers[k]);
		xhr.onload = (e) => res(e.target);
		xhr.onerror = rej;
		if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
		xhr.send(opts.body);
	});
};

const requestCall = (
	subUrl,
	method,
	body,
	headers,
	callBack,
	isFullUrl = false,
	isResponseJson = true
) => {
	
	let myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");


	let reqParams = {
		method: method,
		headers: myHeaders,
		// body: body,
		redirect: "follow",
	};

	if (!!headers) {
		reqParams.headers = headers;
	}

	if (body !== null) {
		reqParams.body = JSON.stringify(body);
	}

	let fullUrl = isFullUrl ? subUrl : cryptoURL + "/" + subUrl; //hostURL
	// console.log(fullUrl);
	if (isResponseJson == false) {
		fetch(fullUrl).then(function (response) {
			return response.text().then((text) => {
				callBack(text, null);
			});
		});
	} else {
		fetch(fullUrl, reqParams)
			.then(function (response) {
				const status = response.ok ? 200 : response.status;

				response.json().then((data) => {
					if (status == 200) {
						callBack(data, null);
					} else {
						let field = null;
						let msg = null;
						if (data.length > 0) {
							field = data[0].field;
							msg = data[0].message;
						}
						let resObj = { field, msg };
						callBack(resObj, status);
					}
				});
			})
			.catch(function (err) {
				callBack(null, err);
			});
	}
};

function BearerHeader(token) {
	const header = {
		Authorization: "Bearer " + token,
	};
	return header;
}

const formDataCall = (
	subUrl,
	method,
	body,
	headers,
	callBack,
	isFullLink = false
) => {
	let link = isFullLink ? subUrl : hostURL + + "/" + subUrl;
	futch(
		link,
		{
			method: method,
			body: body,
			headers: headers,
		},
		(progressEvent) => {
			const progress = progressEvent.loaded / progressEvent.total;
			// console.log(progress);
		}
	).then(
		function (resJson) {
			// console.log("formDataCall response from server!>>>>>|||>>|:> ", resJson);

			try {
				let res = JSON.parse(resJson.response);
				// console.log("after parsing: ", res);
				if (resJson.status == 200) {
					callBack(res, null);
				} else {
					let field = null;
					let msg = null;
					if (res.length > 0) {
						field = res[0].field;
						msg = res[0].message;
					}

					let resObj = { field, msg };

					callBack(resObj, resJson.status);
				}
			} catch (exception) {
				// console.log(exception);
				callBack(null, exception);
			}
		},
		(err) => {
			// console.log("parsing err ", err);
			callBack(null, err);
		}
	);
};

const RestAPI = {
	fullUrl: (url) => {
		return hostURL + url;
	},

	geoCodingFromLocationIQ(lat, lon) {
		let myTokenInLocationIq = "79796c87ec4f44"; // from zyxm gmail account https://my.locationiq.com/

		let url =
			"https://us1.locationiq.com/v1/reverse.php?key=" +
			myTokenInLocationIq +
			"&lat=" +
			lat +
			"&lon=" +
			lon +
			"&format=json";

		return new Promise((resolve, reject) => {
			fetch(url)
				.then(function (res) {
					try {
						let json = res.json();
						return json;
					} catch (e) {
						reject(e);
					}
				})
				.then(
					function (resJson) {
						resolve(resJson);
					},
					(error) => {
						reject(error);
					}
				);
		});
	},

	geoGoogleReverse(place_id, GoogleApiKey) {
		let url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${place_id}&key=${GoogleApiKey}`;

		return new Promise((resolve, reject) => {
			fetch(url)
				.then(function (res) {
					try {
						let json = res.json();
						return json;
					} catch (e) {
						reject(e);
					}
				})
				.then(
					function (resJson) {
						resolve(resJson);
					},
					(error) => {
						reject(error);
					}
				);
		});
	},

	generalGet:(apiSubUrl)=>{
		return new Promise((resolve, reject) => {
			requestCall(apiSubUrl, "GET", null,null, (res, err) => {
				if (err) {
					let errObj = { status: err, ...res };
					reject(errObj);
				} else {
					resolve(res);
				}
			});
		});
	},

	
	generalPost:(apiSubUrl, data, header, isfullUrl)=>{
		return new Promise((resolve, reject) => {
			requestCall(apiSubUrl, "POST", data, header, (res, err) => {
				if (err) {
					let errObj = { status: err, ...res };
					reject(errObj);
				} else {
					resolve(res);
				}
			}, isfullUrl);
		});
	},

	generalFormPost: (subUrl, formData) => {
		return new Promise((resolve, reject) => {
			formDataCall(subUrl, "post", formData, null, (res, err) => {
				if (err) {
                	let errObj = { status: err, ...res };
					reject(errObj);
				} else {
                	resolve(res);
				}
			});
		});
	},

};

export default RestAPI;
