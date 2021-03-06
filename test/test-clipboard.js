/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cc, Ci } = require("chrome");

const imageTools = Cc["@mozilla.org/image/tools;1"].
                    getService(Ci.imgITools);

const io = Cc["@mozilla.org/network/io-service;1"].
                    getService(Ci.nsIIOService);

const base64png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYA" +
                  "AABzenr0AAAASUlEQVRYhe3O0QkAIAwD0eyqe3Q993AQ3cBSUKpygfsNTy" +
                  "N5ugbQpK0BAADgP0BRDWXWlwEAAAAAgPsA3rzDaAAAAHgPcGrpgAnzQ2FG" +
                  "bWRR9AAAAABJRU5ErkJggg%3D%3D";

const base64jpeg = "data:image/jpeg;base64,%2F9j%2F4AAQSkZJRgABAQAAAQABAAD%2F" +
                  "2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCg" +
                  "sOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD%2F2wBDAQMDAwQDBAgEBAgQCw" +
                  "kLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQ" +
                  "EBAQEBAQEBD%2FwAARCAAgACADAREAAhEBAxEB%2F8QAHwAAAQUBAQEBAQ" +
                  "EAAAAAAAAAAAECAwQFBgcICQoL%2F8QAtRAAAgEDAwIEAwUFBAQAAAF9AQ" +
                  "IDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRol" +
                  "JicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eX" +
                  "qDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJ" +
                  "ytLT1NXW19jZ2uHi4%2BTl5ufo6erx8vP09fb3%2BPn6%2F8QAHwEAAwEB" +
                  "AQEBAQEBAQAAAAAAAAECAwQFBgcICQoL%2F8QAtREAAgECBAQDBAcFBAQA" +
                  "AQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNO" +
                  "El8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0" +
                  "dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6ws" +
                  "PExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3%2BPn6%2F9oADAMB" +
                  "AAIRAxEAPwD5Kr8kP9CwoA5f4m%2F8iRqX%2FbH%2FANHJXr5F%2FwAjCn" +
                  "8%2F%2FSWfnnir%2FwAkji%2F%2B4f8A6dgeD1%2BiH8bn1BX5If6FmFqW" +
                  "pXtveyQwzbUXGBtB7D2r9l4U4UyjMsoo4rFUeacua75pLaUktFJLZH5NxN" +
                  "xNmmX5pVw2Gq8sI8tlyxe8U3q03uzD8S3dxqOi3NneSeZDJs3LgDOHBHI5" +
                  "6gV%2BkcG%2BH%2FDmJzuhSq4e8XzfbqfyS%2FvH5rx1xTm2MyDEUa1W8X" +
                  "yXXLFbTi%2BkThv7B0r%2FAJ9f%2FH2%2Fxr90%2FwCIVcI%2F9An%2FAJ" +
                  "Uq%2FwDyZ%2FO%2F16v%2FADfgv8j0r%2FhZvgj%2FAKDf%2FktN%2FwDE" +
                  "V%2Fnr%2FYWYf8%2B%2Fxj%2Fmf3R%2FxFXhH%2FoL%2FwDKdX%2F5Azrv" +
                  "xLouo3D3lne%2BZDJja3luM4GDwRnqDX9LeH%2FBud4nhzD1aVC8Xz%2Fa" +
                  "h%2Fz8l%2FePx%2FinjrIMZm1WtRxF4vls%2BSa2jFdYlDUdRsp7OSKKbc" +
                  "7YwNpHce1fqfCvCub5bm9HFYqjywjzXfNF7xklopN7s%2BC4l4lyvMMrq4" +
                  "fD1bzfLZcsltJPqktkYlfsZ%2BUnBV%2FnufVnXaD%2FAMgqD%2FgX%2Fo" +
                  "Rr%2BxvCr%2FkkcJ%2F3E%2F8ATsz5%2FHfx5fL8kX6%2FQjkCgD%2F%2F" +
                  "2Q%3D%3D";

const canvasHTML = "data:text/html," + encodeURIComponent(
  "<html>\
    <body>\
      <canvas width='32' height='32'></canvas>\
    </body>\
  </html>"
);

function comparePixelImages(imageA, imageB, callback) {
  let tabs = require("sdk/tabs");

  tabs.open({
    url: canvasHTML,

    onReady: function onReady(tab) {
      let worker = tab.attach({
        contentScript: "new " + function() {
          let canvas = document.querySelector("canvas");
          let context = canvas.getContext("2d");

          self.port.on("draw-image", function(imageURI) {
            let img = new Image();

            img.onload = function() {
              context.drawImage(this, 0, 0);

              let pixels = Array.join(context.getImageData(0, 0, 32, 32).data);
              self.port.emit("image-pixels", pixels);
            }

            img.src = imageURI;
          });
        }
      });

      let compared = "";

      worker.port.on("image-pixels", function (pixels) {
        if (!compared) {
          compared = pixels;
          this.emit("draw-image", imageB);
        } else {
          callback(compared === pixels);
          tab.close()
        }
      });

      worker.port.emit("draw-image", imageA);
    }
  });
}


// Test the typical use case, setting & getting with no flavors specified
exports.testWithNoFlavor = function(test) {
  var contents = "hello there";
  var flavor = "text";
  var fullFlavor = "text/unicode";
  var clip = require("sdk/clipboard");
  // Confirm we set the clipboard
  test.assert(clip.set(contents));
  // Confirm flavor is set
  test.assertEqual(clip.currentFlavors[0], flavor);
  // Confirm we set the clipboard
  test.assertEqual(clip.get(), contents);
  // Confirm we can get the clipboard using the flavor
  test.assertEqual(clip.get(flavor), contents);
  // Confirm we can still get the clipboard using the full flavor
  test.assertEqual(clip.get(fullFlavor), contents);
};

// Test the slightly less common case where we specify the flavor
exports.testWithFlavor = function(test) {
  var contents = "<b>hello there</b>";
  var contentsText = "hello there";
  var flavor = "html";
  var fullFlavor = "text/html";
  var unicodeFlavor = "text";
  var unicodeFullFlavor = "text/unicode";
  var clip = require("sdk/clipboard");
  test.assert(clip.set(contents, flavor));
  test.assertEqual(clip.currentFlavors[0], unicodeFlavor);
  test.assertEqual(clip.currentFlavors[1], flavor);
  test.assertEqual(clip.get(), contentsText);
  test.assertEqual(clip.get(flavor), contents);
  test.assertEqual(clip.get(fullFlavor), contents);
  test.assertEqual(clip.get(unicodeFlavor), contentsText);
  test.assertEqual(clip.get(unicodeFullFlavor), contentsText);
};

// Test that the typical case still works when we specify the flavor to set
exports.testWithRedundantFlavor = function(test) {
  var contents = "<b>hello there</b>";
  var flavor = "text";
  var fullFlavor = "text/unicode";
  var clip = require("sdk/clipboard");
  test.assert(clip.set(contents, flavor));
  test.assertEqual(clip.currentFlavors[0], flavor);
  test.assertEqual(clip.get(), contents);
  test.assertEqual(clip.get(flavor), contents);
  test.assertEqual(clip.get(fullFlavor), contents);
};

exports.testNotInFlavor = function(test) {
  var contents = "hello there";
  var flavor = "html";
  var clip = require("sdk/clipboard");
  test.assert(clip.set(contents));
  // If there's nothing on the clipboard with this flavor, should return null
  test.assertEqual(clip.get(flavor), null);
};

exports.testSetImage = function(test) {
  var clip = require("sdk/clipboard");
  var flavor = "image";
  var fullFlavor = "image/png";

  test.assert(clip.set(base64png, flavor), "clipboard set");
  test.assertEqual(clip.currentFlavors[0], flavor, "flavor is set");
};

exports.testGetImage = function(test) {
  test.waitUntilDone();

  var clip = require("sdk/clipboard");

  clip.set(base64png, "image");

  var contents = clip.get();

  comparePixelImages(base64png, contents, function (areEquals) {
    test.assert(areEquals,
      "Image gets from clipboard equals to image sets to the clipboard");

    test.done();
  });
}

exports.testSetImageTypeNotSupported = function(test) {
  var clip = require("sdk/clipboard");
  var flavor = "image";

  test.assertRaises(function () {
    clip.set(base64jpeg, flavor);
  }, "Invalid flavor for image/jpeg");

};

// Notice that `imageTools.decodeImageData`, used by `clipboard.set` method for
// images, write directly to the javascript console the error in case the image
// is corrupt, even if the error is catched.
//
// See: http://mxr.mozilla.org/mozilla-central/source/image/src/Decoder.cpp#136
exports.testSetImageTypeWrongData = function(test) {
  var clip = require("sdk/clipboard");
  var flavor = "image";

  var wrongPNG = "data:image/png" + base64jpeg.substr(15);

  test.assertRaises(function () {
    clip.set(wrongPNG, flavor);
  }, "Unable to decode data given in a valid image.");
};

// TODO: Test error cases.
