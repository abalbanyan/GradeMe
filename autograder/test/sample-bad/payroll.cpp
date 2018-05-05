#include "payroll.hpp"
#include <algorithm>
#include <iterator>

Payroll::Payroll(double cash, TaxTable rates)
  : cash{cash}, tax_rates{rates}
{}

void Payroll::add_employee(Employee&& e) {
  employees.push_back(e);
}

Employee& Payroll::find_employee(const std::string& name) {
  auto it = std::find_if(employees.begin(), employees.end(),
      [&] (const Employee& e) { return e.getName() == name; });
  return *it;
}
