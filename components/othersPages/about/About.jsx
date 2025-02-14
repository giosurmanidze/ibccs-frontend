import React from "react";
import Image from "next/image";
export default function About() {
  return (
    <>
      <section className="flat-spacing-23 flat-image-text-section">
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-image-wrap">
              <Image
                className="lazyload w-100"
                data-src="/images/collections/established.jpg"
                alt="collection-img"
                src="/images/collections/established.jpg"
                width={600}
                height={499}
              />
            </div>
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <div className="heading">Our mission</div>
                <div className="text">
                  To empower our clients to discover and capitalize on unseen
                  opportunities, by providing expert guidance, customized
                  solutions and dedicated support that drive their growth and
                  success. <br className="d-xl-block d-none" />
                  We work individually with every single client in a friendly
                  environment. Based on the best business practices. That foster
                  trust to start, grow and expand businesses of our clients.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="flat-spacing-15">
        <div className="container">
          <div className="tf-grid-layout md-col-2 tf-img-with-text style-4">
            <div className="tf-content-wrap px-0 d-flex justify-content-center w-100">
              <div>
                <div className="heading">Our values</div>
                <div className="text">
                  <p>
                    Efficiency, responsiveness and commitment are the core
                    values being practiced when working with our clients. Every
                    client is very important to us - that is why we put all
                    effort and give our energy to show in a simple way many
                    possibilities for running a business in Georgia.
                  </p>
                  <p>
                    We believe in a long-term relationship with our clients. It
                    all starts with effective communication. Based on honesty
                    and transparency. Complemented by our business experience,
                    competencies and excellent knowledge of the Georgian market.
                  </p>
                  <p>
                    Our responsibility is to be open, honest and
                    straightforward. And deliver the best options so that our
                    clients could make proper decisions. And recommend us to
                    others.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid-img-group">
              <div className="tf-image-wrap box-img item-1">
                <div className="img-style">
                  <Image
                    className="lazyload"
                    src="/images/collections/our_values.webp"
                    data-=""
                    alt="img-slider"
                    width={337}
                    height={388}
                  />
                </div>
              </div>
              <div className="tf-image-wrap box-img item-2">
                <div className="img-style">
                  <Image
                    className="lazyload"
                    src="/images/collections/Tax-form-1024x748.png"
                    data-=""
                    alt="img-slider"
                    width={400}
                    height={438}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
