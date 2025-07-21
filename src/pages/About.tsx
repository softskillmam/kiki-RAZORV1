import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, Target, Heart, Phone, MapPin, Mail } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-kiki-purple-600 to-kiki-blue-600 bg-clip-text text-transparent">KIKI'S Learning Hub</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Empowering minds through personalized learning experiences and comprehensive skill development programs
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-kiki-purple-600" />
              <span>8220879805</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-kiki-purple-600" />
              <span>A global hub for ideas and innovation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 card-shadow rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-xl flex items-center justify-center">
                    <Target className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">Empowering individuals to lead creating courageous, capable changemakers for tomorrow</p>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-kiki-blue-500 to-kiki-purple-500 rounded-xl flex items-center justify-center">
                    <Heart className="text-white w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">Equipping individuals to unlock clarity, grow in confidence, and adapt with strength in a rapidly evolving world.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Founded with a passion for education and a vision to make quality learning accessible to everyone
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl card-shadow p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                KIKI'S Learning Hub was born from the belief that every individual has unique potential waiting to be unlocked. 
                Our journey began with a simple yet powerful idea: to create personalized learning experiences that adapt to 
                each learner's needs, interests, and aspirations.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We understand that traditional one-size-fits-all approaches often fall short of nurturing individual talents. 
                That's why we've developed comprehensive programs that combine cutting-edge technology with proven pedagogical 
                methods to deliver truly personalized learning experiences.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, we're proud to serve learners across various age groups and backgrounds, helping them discover their 
                strengths, overcome challenges, and achieve their goals. Our commitment to excellence and innovation continues 
                to drive us forward as we expand our offerings and reach more learners worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 card-shadow rounded-2xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Personalization</h3>
                <p className="text-gray-600">
                  Every learner is unique, and we tailor our approaches to meet individual needs and learning styles.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow rounded-2xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-kiki-blue-500 to-kiki-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We strive for the highest standards in everything we do, from curriculum design to learner support.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow rounded-2xl text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Empowerment</h3>
                <p className="text-gray-600">
                  We believe in empowering learners with the knowledge, skills, and confidence to achieve their dreams.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-br from-kiki-purple-50 via-white to-kiki-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We'd love to hear from you and answer any questions you might have
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 card-shadow rounded-2xl text-center">
              <CardContent className="p-8 mx-[25px]">
                <div className="w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Phone</h3>
                <p className="text-gray-600">8220879805</p>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow rounded-2xl text-center">
              <CardContent className="p-8 mx-[16px]">
                <div className="w-16 h-16 bg-gradient-to-br from-kiki-blue-500 to-kiki-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Location</h3>
                <p className="text-gray-600">A global hub for ideas and innovation</p>
              </CardContent>
            </Card>

            <Card className="border-0 card-shadow rounded-2xl text-center">
              <CardContent className="p-8 mx-0 px-[7px]">
                <div className="w-16 h-16 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Email</h3>
                <p className="text-gray-600">kikislearninghubklh@gmail.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
