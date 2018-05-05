#ifndef __EMPLOYEE_HPP
#define __EMPLOYEE_HPP

#include <iostream>
#include <string>

class Employee {
  private:
    std::string name;
    std::string job;
    std::string department;
    double salary;

  public:
    Employee(const std::string& name, const std::string& job,
             const std::string& dept, double salary);
    ~Employee() = default;

    std::string getName() const;
    std::string getJob() const;
    std::string getDepartment() const;
    double getSalary() const;

    void setJob(const std::string& job);
    void setDepartment(const std::string& dept);
    void setSalary(double salary);
};

#endif
