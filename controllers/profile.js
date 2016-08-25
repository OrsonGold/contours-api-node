
// **********************************************************

'use strict';

// **********************************************************

var configEnv = require('../config/env.json');
var NODE_ENV = process.env.NODE_ENV;
var NODE_PORT =  process.env.PORT || configEnv[NODE_ENV].NODE_PORT;
var host =  configEnv[NODE_ENV].HOST;
var geo_host =  configEnv[NODE_ENV].GEO_HOST;
var geo_space = configEnv[NODE_ENV].GEO_SPACE;
var AWS_ACCESS_KEY =  configEnv[NODE_ENV].AWS_ACCESS_KEY;
var AWS_SECRET_KEY = configEnv[NODE_ENV].AWS_SECRET_KEY;
var S3_BUCKET = configEnv[NODE_ENV].S3_BUCKET;
var S3_NED_LOCATION;
var S3_ELEV_LOCATION = configEnv[NODE_ENV].S3_ELEV_LOCATION;

var fs = require('fs');
var async = require('async');
var AWS = require('aws-sdk');

AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
        region: 'us-west-2',
        apiVersions: {
                s3: '2006-03-01',
                // other service API versions
                }
});

var s3 = new AWS.S3();

if (NODE_ENV == 'LOCAL') {
	var data_dir = 'data';
}
else {
	var data_dir = '/var/data';
}

var src, lat, lon, rcamsl, nradial, azimuth, format, unit;
var  output_data;
var dist_arr;
var azimuths;


function getProfile(req, res) {
	try {
	
		azimuths = [];
		output_data = [];
		
		console.log(req.url);
		
		var url = req.url;
		
		var startTime = new Date().getTime();
		var endTime;

		if (!url.match(/lat=/i)) {
			res.send({'status': 'error', 'msg': 'missing lat value'});
			return;
		}
		if (!url.match(/lon=/i)) {
			res.send({'status': 'error', 'msg': 'missing lon value'});
			return;
		}
		if (!url.match(/azimuth=/i)) {
			res.send({'status': 'error', 'msg': 'missing azimuth value'});
			return;
		}
		
		src = url.replace(/^.*src=/i, '').replace(/&.*$/, '').toLowerCase();
		src = src.toLowerCase();
		if (src != "ned_1" && src != "ned_2" && src != "ned_13" && src != "gtopo30" && src != "globe") {
			src = "ned_1";
		}
		
		lat = url.replace(/^.*lat=/i, '').replace(/&.*$/, '');
		console.log(lat)
		lon = url.replace(/^.*lon=/i, '').replace(/&.*$/, '');
		azimuth = url.replace(/^.*azimuth=/i, '').replace(/&.*$/, '');
		format = url.replace(/\?.*$/i, '').replace(/^.*\./, '');
		unit = url.replace(/^.*unit=/i, '').replace(/&.*$/, '');
		unit = unit.toLowerCase();
		if (unit != "m" && unit != "mi" && unit != "ft") {
			unit = "m";
		}
		
		nradial = 1;
		
		console.log('ok');
		console.log(azimuth);
		
		var i, j;
		if ( !lat.match(/^-?\d+\.?\d*$/) || !lon.match(/^-?\d+\.?\d*$/) ) {
			res.send({'status': 'error', 'msg': 'invalid Lat/Lon value'});
			return;
		}
		if ( !azimuth.match(/^-?\d+\.?\d*$/) ) {
			res.send({'status': 'error', 'msg': 'invalid azimuth value'});
			return;
		}
		if ( parseFloat(lat) > 90 || parseFloat(lat) < -90 ) {
			res.send({'status': 'error', 'msg': 'Lat value out of range'});
			return;
		}
		if ( parseFloat(lon) > 180 || parseFloat(lon) < -180 ) {
			res.send({'status': 'error', 'msg': 'Lon value out of range'});
			return;
		}

		lat = parseFloat(lat);
		lon = parseFloat(lon);
		azimuth = parseFloat(azimuth);
		src = src.toLowerCase();
		
		console.log('src=' + src + ' lat=' + lat + ' lon=' + lon + ' azimuth=' + azimuth + ' nradial=' + nradial + ' format=' + format + ' unit=' + unit);
		
		
		var num_points_per_radial = 51;
		var num_interval_per_radial = num_points_per_radial - 1;
		var start_point = 3; //kms
		var end_point = 16; //kms
		var dist_delta = (end_point - start_point) / num_interval_per_radial; //distance between 2 points
		
		dist_arr = [];
		for (i = 0; i < num_points_per_radial; i++) {
			dist_arr.push(  Math.round(100 * (start_point + i*dist_delta))/100);
		}
		
		for (i = 0; i < nradial; i++) {
			azimuths.push(Math.round(100.0*i*360/nradial)/100);
		}
		
		azimuths[0] = azimuth;
		
		var latlon;
		var latlon0;
		var lat1 = lat;
		var lon1 = lon;
		var latlon = [];
		var lat_all = [], lon_all = [];
		var filename;
		for (i = 0; i < nradial; i++) {
			for (j = 0; j < num_points_per_radial; j++) {
				var d = dist_arr[j];
				latlon0 = getLatLonFromDist(lat1, lon1, azimuths[i], d);
				lat_all.push(latlon0[0]);
				lon_all.push(latlon0[1]);
				filename = makeFileName(latlon0[0], latlon0[1], src);
				latlon.push([i, j, latlon0[0], latlon0[1], filename]);
			}
		
		}
		
		//console.log(latlon);
		
		var filenames = [];
		var filepath;
		for (i = 0; i < latlon.length; i++) {
		filenames.push(latlon[i][4])
		}
		filenames = uniqArray(filenames);
		
		console.log(filenames);
		//check if file exists
		var filenames_no = [];
		for (i = 0; i < filenames.length; i++) {
			filepath = data_dir + '/' + src + '/' + filenames[i]
			if (!fs.existsSync(filepath)) {
				filenames_no.push(filenames[i]);
			}
		}
		
		console.log(filenames_no);
		
		//fetch data from S3

		var getFileFromS3 = function(filename) { return function(callback) {
			console.log('getting ' + filename);
				
			var params = {
				Bucket: S3_BUCKET,
				Key : S3_ELEV_LOCATION + src + '/' + filename
			};
			
			s3.getObject(params, function(err, data) {
				if (err) {
						console.log(err, err.stack);
						//res.send({'msg': 's3 error', 'error': err.stack, 'file': filename});
						callback();
				}
				else {
						//write to disk
					var filepath = data_dir + '/' + src + '/' + filename;
					console.log('filepath=' + filepath);
					//res.send({'msg': 's3 writeting ' + filepath});
					
					fs.writeFile(filepath, data.Body, 'binary', function(err) {
						if(err) {
								callback();
								return console.log(err);
						}

						var endTime = new Date().getTime();
						var dt = endTime - startTime;
						console.log(filename + ' ok, dt=' + dt);

						callback();
						
					});

				}
			});
			

		}
		}
		
		var asyncTasks = [];
		
		for (i = 0; i < filenames_no.length; i++) {
		asyncTasks.push(getFileFromS3(filenames_no[i]));
		}
		async.parallel(asyncTasks, function() {
			console.log("all done");
			//res.send({'msg': 'get S3 all done', 'filenames_no': filenames_no});
			
			for (i = 0; i < filenames.length; i++) {
				filepath = data_dir + '/' + src + '/' + filenames[i];
				console.log('read file ' + filepath);
				readDataFile(i, filepath, latlon);
			}
		

		output_data = output_data.sort(comparator);

		var output_haat = formatHAAT();
		
		
		endTime = new Date().getTime();
		var elapsed_time = endTime - startTime;
		
		if (format == 'json') {
			output_haat['elapsed_time'] = elapsed_time + ' ms';
		}
		res.send(output_haat);
		});
		

	}
	catch(err) {
		console.log(err);
		res.status(400).send({
			'status': 'error',
        	'statusCode':'400',
        	'statusMessage': 'unable to process elevation data'
        });
		return;
	}
	
	
}



function readDataFile(n, filepath, latlon) {
			var i, j, lat, lon, az, npoint;
			//res.send({'status': 'read', 'filepath': filepath, 'filenames_no': filenames_no});;
			
			var data = fs.readFileSync(filepath);

			var filename = filepath.replace(/^.*\//, '');
			console.log(filename);
			
			var latlon_ul = getLatLonFromFileName(filename);
			var lat_ul = latlon_ul[0];
			var lon_ul = latlon_ul[1];
			var elev;

			for (i = 0; i < latlon.length; i++) {
				if (latlon[i][4] == filename) {
					az = latlon[i][0];
					npoint = latlon[i][1];
					lat = latlon[i][2];
					lon = latlon[i][3];

				//console.log('lat_ul=' + lat_ul + ' lon_ul=' + lon_ul + ' lat=' + lat + ' lon=' + lon);

					if (src == 'ned_1') {
						var data_source = '3DEP 1 arc-second';
					
						var nrow = 3612;
						var ncol = 3612;
						
						var nrow0 = 3600;
						var ncol0 = 3600;
						
						var row = (lat_ul - lat) * nrow0 + 6 + 1;
						var col = (lon - lon_ul) * ncol0 + 6;
						
						row = Math.floor(row);
						col = Math.floor(col);

						var length = 4;
						var position = (row-1) * ncol * 4 + (col - 1) * 4 ;
						elev = Math.round(100*data.slice(position, position+4).readFloatLE(0))/100;
						
						//console.log('row=' + row + ' col=' + col + ' pos=' + position + ' elev=' + elev);
						output_data.push([latlon[i][0], latlon[i][1], latlon[i][2], latlon[i][3], elev])
					}
				}
			}
			
			console.log('total row=' + output_data.length);

		}

		
		function comparator(a, b) {
			if (a[0] < b[0]) {return -1;}
			else if (a[0] > b[0]) {return 1;}
			else {
				//a[0] == b[0]
				if (a[1] < b[1]) {return -1;}
				else if (a[1] > b[1]) {return 1;}
				else {
					return 0;
				}
			
			}
			}
			
		function formatHAAT() {
		
			var haat_av = [];
			var elev_av = [];
			var i, j, elevs;
			
			console.log('nradial=' + nradial)
			for (i = 0; i < nradial; i++) {
				elevs = [];
				for (j = 0; j < output_data.length; j++) {
				
					if (output_data[j][0] == i) {
						elevs.push(output_data[j][4]);
						
					}
				}
				haat_av.push(Math.round( 100*(1000 - arrMean(elevs)) ) / 100.0);
				elev_av.push(Math.round( 100*(arrMean(elevs)) ) / 100.0);
				//console.log(i + ' ' + azimuths[i] + ' ' + haat_av[i] + ' elevs=' + elevs);
			}
			
			var haat_total = Math.round(100*arrMean(haat_av))/100;
		
			//unit conversion
			
			//change distance unit first - in km originally, chnage to meter first
			for (i = 0; i < elevs.length; i++) {
				dist_arr[i] = 1000 * dist_arr[i];
			}
			
			
			var feet_per_meter = 3.28084;
			var miles_per_meter = 0.000621371;
			
			if (unit != "m") {
				for (i = 0; i < elevs.length; i++) {
					if (unit == "ft") {
						elevs[i] = Math.round(100 * elevs[i] * feet_per_meter) / 100;
						dist_arr[i] = Math.round(100 * dist_arr[i] * feet_per_meter) / 100;
					}
					else if (unit == "mi") {
						elevs[i] = Math.round(100000 * elevs[i] * miles_per_meter) / 100000;
						dist_arr[i] = Math.round(100000 * dist_arr[i] * miles_per_meter) / 100000;
					}
				}
				if (unit == "ft") {
					haat_total = Math.round(100 * haat_total * feet_per_meter) / 100;
					elev_av = Math.round(100 * elev_av * feet_per_meter) / 100;
				}
				else if (unit == "mi") {
					haat_total = Math.round(100000 * haat_total * miles_per_meter) / 100000;
					elev_av = Math.round(100000 * elev_av * miles_per_meter) / 100000;
				}
				
			}
			
			console.log('format=' + format);
			
			if (format == 'csv') {
				var content = 'distance,elevation\n'
				for (i = 0; i < dist_arr.length; i++) {
					content += dist_arr[i] + ',' + elevs[i] + '\n';
				}
				return content;
			}
			else if (format == 'json') {
				var content = {
								"status": "success", 
								"statusCode": "200", 
								"statusMessage": "ok",
								'about': {
									'elevation_data_source': 'ned_1, ned_2, ned_13 are 1-, 2- 1/3- arc second NED',
									'azimuth': 'azimuth along which the  profile is made',
									'distance': 'distance from  antenna',
									'elevation': 'elevation at the distance',
									'average_elevation': 'average elevation along the profile',
									'elapsed_time': 'time taken by the system to process this request'
									},
								'elevation_data_source': src,
								'lat': lat,
								'lon': lon,
								'format': format,
								'azimuth': azimuths[0],
								'distance': dist_arr,
								'elevation': elevs,
								'average_elevation': elev_av,
								'unit': unit
			
				};
				return content;	
			}
			else {
				var content = {"status": "error", "msg": "unknown format"};
				return content;
			}
		
		}














function arrMean(arr) {
	if (arr.length > 0) {
		var sum = 0;
		for (var i = 0; i < arr.length; i++)  {
			sum += arr[i];
		}
		return sum/arr.length;
	}
	else {
		return null;
	}
}

function getLatLonFromFileName(filename) {
	var ns = filename.slice(5,6);
	var lat = parseInt(filename.slice(6,8));
	var ew = filename.slice(8,9);
	var lon = parseInt(filename.slice(9,12));
	
	if (ns == 's') {
		lat = -1 * lat;
	}
	if (ew == 'w') {
		lon = -1 * lon;
	}
	
	return [lat, lon];
}

function makeFileName(lat, lon, src) {

	
	if (lat <= -90 || lat > 90 || lon < -180 || lon > 180) {
		res.send({'status': 'error', 'msg': 'Lat/Lon value out of range'});
		return;
	}
	
	if (src != 'ned_1' && src != 'ned_13') {
		res.send({'status': 'error', 'msg': 'Wrong data type'});
		return;
	}

	var ns = 'n';
	if (lat < 0) {
		ns = 's';
	}
	var ew = 'w';
	if (lon >= 0) {
		ew = 'e';
	}
	
	var lat_ul = Math.abs(Math.ceil(lat));
	var lon_ul = Math.abs(Math.floor(lon));
	
	var lat_str = padZero(lat_ul, 2);
	var lon_str = padZero(lon_ul, 3);
	
	
	
	var filename = 'float' + ns + lat_str + ew + lon_str + '_' + src.replace('ned_', '') + '.flt';

	return filename;
}

function padZero(a, n) {
	//n - total number of digits
	var a_str = a + '';
	while (a_str.length < n) {
		a_str = '0' + a_str;
	}
	
	return a_str;
}

function getLatLonFromDist(lat1, lon1, az, d) {
//az: azimuth in degrees
//d: distance in km

    lat1 = lat1 * Math.PI / 180.0;
    lon1 = lon1 * Math.PI / 180.0;
    az = az * Math.PI / 180.0;

    var R = 6371; //earth radius in kms
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(az));
    var lon2 = lon1 + Math.atan2(Math.sin(az) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

    lat2 = lat2 * 180 / Math.PI;
    lon2 = lon2 * 180 / Math.PI;

    return [lat2, lon2]

}

function uniqArray(arr) {
	var i;
	var a = arr.sort();
	var uniq = [];
	for (i = 0; i <a.length-1; i++) {
		if (a[i] != a[i+1]) {
			uniq.push(a[i]);
		}
	}
	uniq.push(a[a.length-1]);
	
	return uniq;
}













module.exports.getProfile = getProfile;