#ifndef __PAYROLL_HPP
#define __PAYROLL_HPP

#include <iostream>
#include <string>
#include <utility>
#include <vector>

#include "employee.hpp"

using TaxRate = std::pair<double, double>;
using TaxTable = std::vector<TaxRate>;

class Payroll {
  private:
    double cash;
    TaxTable& tax_rates;
    std::vector<Employee> employees;

  public:
    Payroll(double cash, TaxTable rates);
    ~Payroll() = default;

    void add_employee(Employee&& e);
    Employee& find_employee(const std::string& name);
    //void add_taxRate(TaxRate r);
    //double pay_employees();
};

#endif
