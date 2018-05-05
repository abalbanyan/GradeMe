#include "employee.hpp"

using std::string;

Employee::Employee(const string& name, const string& job, const string& dept,
                   double salary)
  : name{name}, job{job}, department{dept}, salary{salary}
{}

string Employee::getName() const {
  return name;
}

string Employee::getJob() const {
  return job;
}

string Employee::getDepartment() const {
  return department;
}

double Employee::getSalary() const {
  return salary;
}

void Employee::setJob(const string& job) {
  this->job = job;
}

void Employee::setDepartment(const string& dept) {
  department = dept;
}

void Employee::setSalary(double salary) {
  this->salary = salary;
}
