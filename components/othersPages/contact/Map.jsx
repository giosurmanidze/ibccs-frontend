import { socialLinksWithBorder } from "@/data/socials";
import React from "react";

export default function Map() {
  return (
    <section className="flat-spacing-9">
      <div className="container">
        <div className="tf-grid-layout gap-0 lg-col-2">
          <div className="d-flex flex-column gap-3 w-100">
            <div>
              {" "}
              <b>Tbilisi Office</b>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2978.482190386937!2d44.7736806!3d41.7101128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x404473952e9571cb%3A0x1631de42d4e2bc0c!2sIBCCS%20GEORGIA%20Tbilisi!5e0!3m2!1sen!2sge!4v1739518846855!5m2!1sen!2sge"
                width="100%"
                height={350}
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />{" "}
            </div>
            <div>
              {" "}
              <b> Batumi Office</b>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2981.7650713671337!2d41.617024!3d41.639209199999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406787fa943e18cd%3A0x105adfdfaf372335!2sIBCCS%20GEORGIA%20Batumi!5e0!3m2!1sen!2sge!4v1739518954554!5m2!1sen!2sge"
                width="100%"
                height={350}
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className="tf-content-left has-mt">
            <div className="sticky-top">
              <h4 className="mb_20">Contact us</h4>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Country/City</strong>
                </p>
                <p>Georgia,Tbilisi</p>
              </div>{" "}
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Address</strong>
                </p>
                <p>66 Mott St, New York, New York, Zip Code: 10006, AS</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Phone</strong>
                </p>
                <p>(623) 934-2400</p>
              </div>
              <div className="mb_20">
                <p className="mb_15">
                  <strong>Email</strong>
                </p>
                <p>EComposer@example.com</p>
              </div>
              <div className="mb_36">
                <p className="mb_15">
                  <strong>Open Time</strong>
                </p>
                <p className="mb_15">Our store has re-opened for shopping,</p>
                <p>exchange Every day 11am to 7pm</p>
              </div>
              <div>
                <ul className="tf-social-icon d-flex gap-20 style-default">
                  {socialLinksWithBorder.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className={`box-icon link round ${link.className} ${link.borderClass}`}
                      >
                        <i
                          className={`icon ${link.iconSize} ${link.iconClass}`}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
