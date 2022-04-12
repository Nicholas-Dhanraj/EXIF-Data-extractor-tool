import { useState, useEffect } from "react";
import Nav from "../Nav/Nav";

import Image from "next/image";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import piexif from "piexifjs";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      margin: "75px auto",
      maxWidth: "95vw",
    },
  },
  input: {
    display: "none",
  },
  divider: {
    background: theme.palette.divider,
  },
}));

const defaultProps = {
  bgcolor: "background.paper",
  m: 1,
  style: { width: "5rem", height: "5rem" },
  borderColor: "primary.main",
};
const homePage = () => {
  const classes = useStyles();

  const [updated, setUpdated] = useState(false);
  const [files, setFile] = useState([]);
  const [upload, setUpload] = useState(false);
  const [exifData, setExifData] = useState([]);
  const [currExif, setCurrExif] = useState({});
  const [currImage, setCurrImage] = useState();
  const [final, setFinal] = useState("");
  const [finalCSV, setFinalCSV] = useState("");

  const initialValues = {
    make: "",
    model: "",
    osVersion: "",
    lat: "",
    long: "",
    dateTime: "",
  };
  const [values, setValues] = useState(initialValues);

  //selcted files from local disk handler
  const handlerFile = (e) => {
    let allfiles = [];
    for (let i = 0; i < e.target.files.length; i++) {
      allfiles.push(e.target.files[i]);
    }
    if (allfiles.length > 0) {
      setFile(allfiles);
    }
  };

  //display selected files from local disk
  const handleUpload = (e) => {
    setUpload(true);
  };

  //extract exif data from currently selected image and display it if available
  const getExif = (e, i) => {
    var file = files[i];

    var reader = new FileReader();
    reader.onload = async function (e) {
      console.time("read exif");
      const exifObj = piexif.load(e.target.result);

      setCurrImage(e.target.result);
      setCurrExif(exifObj);

      let exifArr = [];
      // read latitude
      const lat = piexif.GPSHelper.dmsRationalToDeg(
        exifObj["GPS"][piexif.GPSIFD.GPSLatitude],
        exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef]
      );

      // read longitude
      const long = piexif.GPSHelper.dmsRationalToDeg(
        exifObj["GPS"][piexif.GPSIFD.GPSLongitude],
        exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef]
      );
      const make = exifObj["0th"][piexif.ImageIFD.Make] || "";
      exifArr.push(`Make: ${make}`);

      const model = exifObj["0th"][piexif.ImageIFD.Model] || "";
      exifArr.push(`Model: ${model}`);

      const osVersion = exifObj["0th"][piexif.ImageIFD.Software] || "";
      exifArr.push(`OS version: ${osVersion}`);

      exifArr.push(`Latitude: ${lat}`);
      exifArr.push(`Longitude: ${long}`);

      const dateTime = exifObj["0th"][piexif.ImageIFD.DateTime] || "";
      const dateTimeOriginal =
        exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] || "";
      const subsecTimeOriginal =
        exifObj["Exif"][piexif.ExifIFD.SubSecTimeOriginal] || "";

      exifArr.push(`DateTime: ${dateTime}`);
      exifArr.push(
        `DateTimeOriginal: ${dateTimeOriginal}.${subsecTimeOriginal}`
      );
      setValues({
        make: make,
        model: model,
        osVersion: osVersion,
        lat: lat,
        long: long,
        dateTime: dateTime,
      });

      setExifData(exifArr);

      console.timeEnd("read exif");
    };
    reader.readAsDataURL(file);
    setUpdated(true);
  };

  //handle modified exif field events
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  //modify exif by passing in new exif instance and
  //attaching Uint8Array -> BASE64 data to img
  const setExif = (e, i) => {
    const newImageData = currImage;

    const newExif = {
      "0th": { ...currExif["0th"] },
      Exif: { ...currExif["Exif"] },
      GPS: { ...currExif["GPS"] },
      Interop: { ...currExif["Interop"] },
      "1st": { ...currExif["1st"] },
      thumbnail: null,
    };

    const newMake = values.make;
    const newModel = values.model;
    const newOsVersion = values.osVersion;
    const newLat = values.lat;
    const newLong = values.long;
    const newDateTime = values.dateTime;

    newExif["0th"][piexif.ImageIFD.Make] = newMake;
    newExif["0th"][piexif.ImageIFD.Model] = newModel;
    newExif["0th"][piexif.ImageIFD.Software] = newOsVersion;
    newExif["0th"][piexif.ImageIFD.DateTime] = newDateTime;
    newExif["GPS"][piexif.GPSIFD.GPSLatitude] =
      piexif.GPSHelper.degToDmsRational(newLat);

    // Convert the new Exif object into binary form
    const newExifBinary = piexif.dump(newExif);
    // Embed the Exif data into the image data
    const newPhotoData = piexif.insert(newExifBinary, newImageData);
    // Save the new photo to a file
    let fileBuffer = Buffer.from(newPhotoData, "binary");
    // fs.writeFileSync("./images/revised.jpg", fileBuffer);
    const content = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 5,
      0, 0, 0, 5, 8, 6, 0, 0, 0, 141, 111, 38, 229, 0, 0, 0, 28, 73, 68, 65, 84,
      8, 215, 99, 248, 255, 255, 63, 195, 127, 6, 32, 5, 195, 32, 18, 132, 208,
      49, 241, 130, 88, 205, 4, 0, 14, 245, 53, 203, 209, 142, 14, 31, 0, 0, 0,
      0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);

    var binary = "";
    var bytes = new Uint8Array(fileBuffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    setFinal(binary);
  };

  var csvContent = "data:text/csv;charset=utf-8,";

  //get exif data for curr image and convert to csv format
  const setCSV = () => {
    const newImageData = currImage;

    const newExif = {
      "0th": { ...currExif["0th"] },
      Exif: { ...currExif["Exif"] },
      GPS: { ...currExif["GPS"] },
      Interop: { ...currExif["Interop"] },
      "1st": { ...currExif["1st"] },
      thumbnail: null,
    };

    const newMake = values.make;
    const newModel = values.model;
    const newOsVersion = values.osVersion;
    const newLat = values.lat;
    const newLong = values.long;
    const newDateTime = values.dateTime;

    newExif["0th"][piexif.ImageIFD.Make] = newMake;
    newExif["0th"][piexif.ImageIFD.Model] = newModel;
    newExif["0th"][piexif.ImageIFD.Software] = newOsVersion;
    newExif["0th"][piexif.ImageIFD.DateTime] = newDateTime;
    newExif["GPS"][piexif.GPSIFD.GPSLatitude] =
      piexif.GPSHelper.degToDmsRational(newLat);

    const arr = ["0th", "Exif", "GPS", "Interop", "1st", "thumbnail"];

    Object.entries(newExif["0th"]).forEach(([key, value], index) => {
      console.log(`${index}: ${key} = ${value}`);

      var innerValue = value ? `${key} = ${value.toString()}` : "";
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (index > 0) csvContent += ",";
      csvContent += result;
    });
    csvContent += "\n";

    Object.entries(newExif["Exif"]).forEach(([key, value], index) => {
      var innerValue = value ? `${key} = ${value.toString()}` : "";

      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (index > 0) csvContent += ",";
      csvContent += result;
    });
    csvContent += "\n";

    Object.entries(newExif["GPS"]).forEach(([key, value], index) => {
      var innerValue = value ? `${key} = ${value.toString()}` : "";

      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (index > 0) csvContent += ",";
      csvContent += result;
    });
    csvContent += "\n";
    console.log(csvContent);
    setFinalCSV(csvContent);
  };
  var test =
    "iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAJUlEQVR42u3NQQEAAAQEsJNcdFLw2gqsMukcK4lEIpFIJBLJS7KG6yVo40DbTgAAAABJRU5ErkJggg==";
  return (
    <div className="container mt-10">
      {" "}
      <Nav />
      <Typography className="container mb-5" variant="h2"></Typography>
      <div className="row">
        <div className="col-5" border={1}>
          <br />
          <Paper elevation={10}>
            <div>
              <input
                className="offset-0 col-6 m-2"
                id="contained-button-file"
                multiple
                type="file"
                accept=".jpeg,.jpg"
                onChange={handlerFile}
              />
            </div>
            <Button
              className="offset-0 m-2"
              variant="contained"
              color="primary"
              component="span"
              onClick={handleUpload}
            >
              Upload
            </Button>
          </Paper>
          <Paper elevation={10}>
            <Typography className="mt-4 mb-2" variant="h4">
              My Uploaded Images:
            </Typography>

            <div className="offset-0 col-8 m-2">
              <div>
                {upload &&
                  files.map((file, key) => {
                    return (
                      <span key={key} className="Row">
                        <span className="Filename">
                          {file.name}
                          <Image
                            width={300}
                            height={200}
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="offset-0 mt-1 mb-2 ml-2"
                          />{" "}
                        </span>
                        <Button
                          className="offset-0 mt-1 mb-2 ml-2"
                          variant="contained"
                          color="secondary"
                          component="span"
                          onClick={(e) => getExif(e, key)}
                        >
                          Get EXIF data
                        </Button>
                        <Divider
                          variant="fullWidth"
                          background="black"
                          style={{ border: "2px solid" }}
                        />
                      </span>
                    );
                  })}
              </div>
            </div>
          </Paper>
        </div>
        <div style={{ width: "55%" }}>
          <br />
          <Paper elevation={10} className="col mt-6">
            <Typography
              component={"span"}
              className="offset-0 m-2"
              variant="h4"
            >
              {"EXIF Data: -------------------------------------------"}
              <br />
              <br />
              {Object.entries(values).map(([key, value], i) => {
                return (
                  <Typography className="offset-0 m-2" variant="h5" key={i}>
                    <div>
                      <span>
                        {`${key}:`}
                        <span style={{ marginLeft: `${20 / key.length}rem` }}>
                          <input
                            className="m-1 col-8"
                            id="contained-button-file"
                            type="text"
                            value={value}
                            onChange={handleInputChange}
                            name={key}
                          />
                        </span>
                      </span>

                      <Divider
                        background="black"
                        style={{ border: "2px solid" }}
                      />
                    </div>
                  </Typography>
                );
              })}
              <br />

              <a download="modified.jpeg" target="_blank" href={final}>
                <Button
                  className="offset-0 m-2"
                  variant="contained"
                  color="primary"
                  component="span"
                  onClick={setExif}
                  disabled={updated ? false : true}
                >
                  Download Image
                </Button>
              </a>
              <a download="modified.csv" target="_blank" href={finalCSV}>
                <Button
                  className="offset-0 m-2"
                  variant="contained"
                  color="primary"
                  component="span"
                  onClick={setCSV}
                  disabled={updated ? false : true}
                >
                  Export CSV
                </Button>
              </a>
              <Typography className="m-2" variant="h4">
                Currently selected img
                <img width="100" height="100" src={final} className="m-3" />
              </Typography>
            </Typography>
          </Paper>{" "}
        </div>
      </div>
    </div>
  );
};

export default homePage;
