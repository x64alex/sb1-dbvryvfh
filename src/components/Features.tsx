import React, { useState } from 'react';
import { CheckCircle, Play, Pause } from 'lucide-react';

export function Features() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Unmask Calls Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Unmask Any Blocked, Unknown, or Restricted Call</h2>
              <p className="text-gray-600 mb-8">
                TrapCall reveals the real phone number behind blocked, unknown, and restricted calls. No more mystery callers – know exactly who's trying to reach you.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>See caller's real phone number</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Get name and address lookup</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Works with any phone carrier</span>
                </li>
              </ul>
            </div>
            <div className="max-w-xs mx-auto md:ml-auto">
              <img
                src="https://www.trapcall.com/static/images/feature-unmask.jpg"
                alt="Phone call protection"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Block Harassing Callers Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xs mx-auto order-2 md:order-1">
              <img
                src="https://www.trapcall.com/static/images/feature-blacklist.png"
                alt="Block harassing callers"
                className="rounded-lg w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Block Harassing Callers</h2>
              <p className="text-gray-600 mb-8">
                We have built a better block list to give you back your privacy. Annoying callers you have added to your block list give up when they hear a message that your phone has been disconnected every time they call.
              </p>
              <button
                onClick={togglePlay}
                className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-sm hover:shadow transition-all text-blue-600 font-medium"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 mr-2" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                Hear the message
              </button>
              <audio
                ref={audioRef}
                src="https://www.trapcall.com/audio/blacklist_message.mp3"
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call Recording Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Record Incoming Calls Automatically</h2>
              <p className="text-gray-600 mb-8">
                Never miss important details from your calls. TrapCall automatically records your incoming calls and stores them securely in the cloud.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Automatic call recording</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Secure cloud storage</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Easy playback and download</span>
                </li>
              </ul>
            </div>
            <div className="max-w-xs mx-auto md:ml-auto">
              <img
                src="https://www.trapcall.com/static/images/feature-recording.png"
                alt="Call recording"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Lock Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-xs mx-auto order-2 md:order-1">
              <img
                src="https://www.trapcall.com/static/images/feature-privacylock.png"
                alt="Privacy lock protection"
                className="rounded-lg w-full"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6">Privacy Lock. Protection Beyond Blocked Numbers.</h2>
              <p className="text-gray-600 mb-8">
                Even if a call does not have a real phone number associated with it, you are protected. By forcing 'Unknown' callers to identify themselves, you will know who is calling before you answer.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Force caller identification</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Enhanced privacy protection</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span>Screen calls effectively</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}