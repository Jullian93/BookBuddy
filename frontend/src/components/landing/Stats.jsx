import React from 'react';

const Stats = () => {
  const stats = [
    { id: 1, name: 'Books Available', value: '10,000+' },
    { id: 2, name: 'Active Users', value: '2,500+' },
    { id: 3, name: 'Monthly Borrows', value: '5,000+' },
    { id: 4, name: 'Success Rate', value: '99.9%' },
  ];

  return (
    <div className="bg-primary-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-black sm:text-4xl">
            Trusted by students and librarians
          </h2>
          <p className="mt-3 text-xl text-primary-200 sm:mt-4">
            Our library management system has been serving academic institutions for years with reliability and ease of use.
          </p>
        </div>
        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                {stat.name}
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-black">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default Stats;
