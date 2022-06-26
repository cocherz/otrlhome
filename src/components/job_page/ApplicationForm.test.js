import React, { useState } from "react";
import { GATracker } from "../structure/GoogleAnalytics";
import { emailValidate, validate, fileTypeValid } from "../structure/validation";

export const ApplicationForm = ({ jobTitle }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState("");
  const [base64, setBase64] = useState("");
  const [loading, setLoadingState] = useState();
  const [failedSend, setFailedSend] = useState(false);

  const gaEvent = GATracker(`Job-post-${jobTitle}`);
  const isValid = () => {
    let valid = true;
    let emailValid = emailValidate(email);
    let lastNameValid = validate(lastName, "last-name");
    let firstNameValid = validate(firstName, "first-name");
    let fileValid = fileTypeValid(files, "resume");
    valid = firstNameValid && lastNameValid && firstNameValid && fileValid && emailValid;

    if (valid === true) {
      gaEvent("Applied-for-job", "job application");
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValid()) {
      const url = "https://9ms7dfz6i0.execute-api.eu-west-1.amazonaws.com/stage/send";
      const config = {
        mode: "no-cors",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderName: "maxwell.cochrane+dev@gmail.com",
          senderEmail: "maxwell.cochrane+dev@gmail.com",
          subject: `${jobTitle} application from ${firstName} ${lastName}`,
          message: `New application from ${firstName} ${lastName} ${email}`,
          base64Data: base64,
          fileName: files.name,
        }),
      };
      console.log(config);
      const response = await fetch(url, config).then(setLoadingState(true));

      if ((response.response = "ok")) {
        setLoadingState(false);
        document.getElementById("unsubmitted").style.display = "none";
        document.getElementById("submitted").style.display = "block";
        return response;
      } else {
        console.log(response);
        setLoadingState(false);
        setFailedSend(true);
        console.log(response, "error");
        return response;
      }
    }
  };

  const dropFile = (e) => {
    const files = e[0];
    setFiles(null);
    setFiles(files);
    removeStyle();
    getBase64(files);
  };

  const addFile = (e) => {
    const files = e.target.files[0];
    setFiles(null);
    setFiles(files);
    removeStyle();
    getBase64(files);
  };
  const onLoad = (fileString) => {
    setBase64(fileString.split(",")[1]);
  };
  const getBase64 = (file) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      onLoad(reader.result);
    };
  };

  const preventBubbling = (e) => {
    e.stopPropagation();
    e.preventDefault();
    document.getElementById("resume").style.background = "#f8fbff";
  };

  const removeStyle = () => {
    document.getElementById("resume").style.background = "#ffffff";
  };

  return (
    <section>
      <form
        id="unsubmitted"
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        className="application-form"
      >
        <h3 aria-label="Application form"> Application</h3>

        <label aria-label="First name">
          <span aria-hidden="true"> First Name * </span>
          <input className="input-field" name="firstName" id="first-name" type="text" checked={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </label>
        <h5 id="first-name-error" className="error-message" aria-label="First name is invalid">
          {" "}
          * Please enter your first name{" "}
        </h5>

        <label aria-label="Last name">
          <span aria-hidden="true"> Last Name * </span>
          <input className="input-field" name="lastName" id="last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </label>

        <h5 id="last-name-error" className="error-message" aria-label="Last name is invalid">
          {" "}
          * Please enter your last name{" "}
        </h5>
        <label aria-label="Email Address">
          <span aria-hidden="true"> Email Address * </span>
          <input className="input-field" name="email" id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <h5 id="email-error" className="error-message" aria-label="Email is invalid">
          {" "}
          * Please check your email{" "}
        </h5>
        <label>
          <span aria-hidden="true"> Resume * </span>
          <div
            className="custom-file-upload"
            id="resume"
            accept=".pdf, .doc, .docx"
            onDragEnter={preventBubbling}
            onDragOver={preventBubbling}
            onPointerOver={preventBubbling}
            onPointerLeave={removeStyle}
            onDragLeave={removeStyle}
            onDrop={(e) => {
              preventBubbling(e);
              dropFile(e.dataTransfer.files);
            }}
          >
            <label htmlFor="file-upload" aria-hidden="false">
              {files && (
                <div
                  className="cursorpointer"
                  onClick={(e) => {
                    setFiles(null);
                    e.preventDefault();
                  }}
                >
                  <h3 className="banner-content"> {files.name.substring(0, 26) + "..."} </h3>
                  <span> click to remove </span>
                </div>
              )}
              {!files && (
                <div className="cursorpointer">
                  <strong>
                    <span>Drop your resume here </span> <span className="purple-text cursorpointer"> or browse </span>
                  </strong>
                  <br />
                  <span>Max. file size: 4MB (pdf, doc, docx) </span>
                </div>
              )}
            </label>
            {!files && <input id="file-upload" type="file" accept=".pdf, .doc, .docx" onChange={addFile} />}
          </div>
          <h5 id="resume-error" className="error-message" aria-label="error, please attach a resume">
            {" "}
            * Please attach your resume in pdf, doc, or docx{" "}
          </h5>
        </label>

        <div className="submitCTA">
          <button type="submit" value="Submit" className="primary-button wide-btn">
            {loading ? <div className="loader" /> : "Apply"}
          </button>
        </div>
        {!failedSend ? (
          true
        ) : (
          <h5 id="send-error" className="message" aria-label="Email is invalid">
            * Unfourtunatley there was an error, please try again
          </h5>
        )}
      </form>
      <div className="application-form " id="submitted">
        {" "}
        <h3>Thanks for applying to our {jobTitle} role, if its a match we'll be in touch! </h3>{" "}
      </div>
    </section>
  );
};
