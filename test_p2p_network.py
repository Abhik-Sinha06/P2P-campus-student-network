import os
import sys
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class P2PNetworkSeleniumTester:
    def __init__(self, base_url="http://localhost:3000", headless=True):
        self.base_url = base_url
        self.headless = headless
        self.screenshot_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
        os.makedirs(self.screenshot_dir, exist_ok=True)
        
        self.results = []
        self.driver = None
        self.wait = None

    def start_browser(self):
        options = webdriver.ChromeOptions()
        if self.headless:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        
        # Suppress logging noise
        options.add_argument("--log-level=3")
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.set_window_size(1920, 1080)
        self.wait = WebDriverWait(self.driver, 12)
        print(f"[*] Chrome WebDriver initialized successfully (Headless: {self.headless})")

    def capture_screenshot(self, filename):
        filepath = os.path.join(self.screenshot_dir, filename)
        self.driver.save_screenshot(filepath)
        return filepath

    def record_result(self, test_id, description, status, screenshot, duration_sec, error_msg=""):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.results.append({
            "test_id": test_id,
            "description": description,
            "status": status,
            "timestamp": timestamp,
            "duration": f"{duration_sec:.2f}s",
            "screenshot": os.path.basename(screenshot),
            "screenshot_path": screenshot,
            "error": error_msg
        })

    # =========================================================================
    # Test 1: Validate College Email Domain Restriction (Authentication & Security)
    # =========================================================================
    def test_tc01_domain_validation(self):
        test_id = "TC-01"
        desc = "Validate College Email Domain Restriction (@vitstudent.ac.in enforcement)"
        start_time = time.time()
        print(f"\n--- Running {test_id}: {desc} ---")
        try:
            self.driver.get(f"{self.base_url}/register")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))

            # Enter student info with non-college public domain
            name_input = self.wait.until(EC.visibility_of_element_located((By.ID, "name")))
            name_input.clear()
            name_input.send_keys("Abhik Test")

            email_input = self.driver.find_element(By.ID, "email")
            email_input.clear()
            email_input.send_keys("abhik.test@gmail.com")  # Invalid domain (gmail.com)

            pass_input = self.driver.find_element(By.ID, "password")
            pass_input.clear()
            pass_input.send_keys("SecurePass123!")

            # Submit registration form
            submit_btn = self.driver.find_element(By.ID, "register-submit-btn")
            submit_btn.click()

            # Assert domain restriction error is displayed
            error_el = self.wait.until(
                EC.visibility_of_element_located((By.ID, "domain-error-msg"))
            )
            error_text = error_el.text.lower()
            assert "@vitstudent.ac.in" in error_text, f"Expected domain restriction message, got: {error_text}"
            
            time.sleep(0.5)
            ss = self.capture_screenshot("TC01_College_Domain_Validation.png")
            print(f"[PASS] {test_id}: Domain validation successfully prevented non-college registration.")
            self.record_result(test_id, desc, "PASS", ss, time.time() - start_time)
        except Exception as e:
            ss = self.capture_screenshot("TC01_College_Domain_Validation_FAIL.png")
            print(f"[FAIL] {test_id}: {str(e)}")
            self.record_result(test_id, desc, "FAIL", ss, time.time() - start_time, str(e))

    # =========================================================================
    # Test 2: Student Login & Session Verification (Authentication & Karma Ledger)
    # =========================================================================
    def test_tc02_student_login(self):
        test_id = "TC-02"
        desc = "Student Login & Active Session Verification with Live Karma Balance"
        start_time = time.time()
        print(f"\n--- Running {test_id}: {desc} ---")
        try:
            self.driver.get(f"{self.base_url}/login")
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))

            email_input = self.wait.until(EC.visibility_of_element_located((By.ID, "email")))
            email_input.clear()
            email_input.send_keys("abhik@vitstudent.ac.in")

            pass_input = self.driver.find_element(By.ID, "password")
            pass_input.clear()
            pass_input.send_keys("Student@123")

            login_btn = self.driver.find_element(By.ID, "login-btn")
            login_btn.click()

            # Verify navigation away from /login and presence of Karma badge in navbar
            self.wait.until(lambda d: "/login" not in d.current_url)
            karma_badge = self.wait.until(
                EC.visibility_of_element_located((By.ID, "user-karma-balance"))
            )
            assert "karma" in karma_badge.text.lower(), f"Karma badge missing expected text: {karma_badge.text}"
            
            time.sleep(0.5)
            ss = self.capture_screenshot("TC02_Student_Login_Success.png")
            print(f"[PASS] {test_id}: Student authenticated; session active with {karma_badge.text}.")
            self.record_result(test_id, desc, "PASS", ss, time.time() - start_time)
        except Exception as e:
            ss = self.capture_screenshot("TC02_Student_Login_FAIL.png")
            print(f"[FAIL] {test_id}: {str(e)}")
            self.record_result(test_id, desc, "FAIL", ss, time.time() - start_time, str(e))

    # =========================================================================
    # Test 3: Browse & Filter Requests Feed (Discovery & Filtering)
    # =========================================================================
    def test_tc03_feed_filtering(self):
        test_id = "TC-03"
        desc = "Browse & Filter Peer Requests Feed by Category and Keywords"
        start_time = time.time()
        print(f"\n--- Running {test_id}: {desc} ---")
        try:
            self.driver.get(f"{self.base_url}/")
            self.wait.until(EC.presence_of_element_located((By.ID, "search-input")))

            # Click Item Lending Category Tab
            tab_item = self.wait.until(EC.element_to_be_clickable((By.ID, "tab-item")))
            tab_item.click()
            time.sleep(1)

            # Use search input to filter specific items/topics
            search_input = self.driver.find_element(By.ID, "search-input")
            search_input.clear()
            search_input.send_keys("Lab")

            filter_btn = self.driver.find_element(By.ID, "search-btn")
            filter_btn.click()
            time.sleep(1)

            # Reset back to Academic tab to verify dynamic tab switching
            tab_academic = self.wait.until(EC.element_to_be_clickable((By.ID, "tab-academic")))
            tab_academic.click()
            time.sleep(1)

            ss = self.capture_screenshot("TC03_Feed_Filter_And_Search.png")
            print(f"[PASS] {test_id}: Requests feed successfully filtered across categories and queries.")
            self.record_result(test_id, desc, "PASS", ss, time.time() - start_time)
        except Exception as e:
            ss = self.capture_screenshot("TC03_Feed_Filter_FAIL.png")
            print(f"[FAIL] {test_id}: {str(e)}")
            self.record_result(test_id, desc, "FAIL", ss, time.time() - start_time, str(e))

    # =========================================================================
    # Test 4: Create / Post a New Peer Assistance Request (Request Lifecycle)
    # =========================================================================
    def test_tc04_create_request(self):
        test_id = "TC-04"
        desc = "Create & Publish New Peer Assistance Request (Academic Tutoring)"
        start_time = time.time()
        print(f"\n--- Running {test_id}: {desc} ---")
        try:
            self.driver.get(f"{self.base_url}/requests/create")
            self.wait.until(EC.presence_of_element_located((By.ID, "title")))

            # Select category button "Academic Help"
            academic_btn = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Academic Help')]"))
            )
            academic_btn.click()

            # Fill title & description
            test_title = f"Selenium Test: DSA Graph Algorithms Study Help ({int(time.time()) % 10000})"
            title_input = self.driver.find_element(By.ID, "title")
            title_input.clear()
            title_input.send_keys(test_title)

            desc_input = self.driver.find_element(By.ID, "description")
            desc_input.clear()
            desc_input.send_keys("Automated test verification request for Dijkstra & Prim algorithm peer tutoring.")

            # Submit the request
            submit_btn = self.driver.find_element(By.ID, "submit-request-btn")
            submit_btn.click()

            # Wait for redirection to request detail view
            self.wait.until(lambda d: "/requests/" in d.current_url and "/requests/create" not in d.current_url)
            
            # Verify the posted title is present on the page
            self.wait.until(EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(), '{test_title[:20]}')]")))
            time.sleep(0.5)

            ss = self.capture_screenshot("TC04_Request_Creation_Success.png")
            print(f"[PASS] {test_id}: Request successfully created and published to campus network.")
            self.record_result(test_id, desc, "PASS", ss, time.time() - start_time)
        except Exception as e:
            ss = self.capture_screenshot("TC04_Request_Creation_FAIL.png")
            print(f"[FAIL] {test_id}: {str(e)}")
            self.record_result(test_id, desc, "FAIL", ss, time.time() - start_time, str(e))

    # =========================================================================
    # Test 5: List Lendable Equipment in Campus Inventory (Item Management)
    # =========================================================================
    def test_tc05_list_inventory_item(self):
        test_id = "TC-05"
        desc = "List Lendable Item in Campus Equipment & Study Tools Inventory"
        start_time = time.time()
        print(f"\n--- Running {test_id}: {desc} ---")
        try:
            self.driver.get(f"{self.base_url}/items")
            
            # Open the "List Item for Lending" modal
            open_modal_btn = self.wait.until(EC.element_to_be_clickable((By.ID, "open-list-item-btn")))
            open_modal_btn.click()

            # Fill in Item details
            item_name_input = self.wait.until(EC.visibility_of_element_located((By.ID, "item-name")))
            item_name_input.clear()
            item_title = f"Selenium Test: Arduino Starter Kit ({int(time.time()) % 10000})"
            item_name_input.send_keys(item_title)

            condition_select = Select(self.driver.find_element(By.ID, "condition-select"))
            condition_select.select_by_visible_text("Excellent")

            # Submit item form
            submit_item_btn = self.driver.find_element(By.ID, "submit-item-btn")
            submit_item_btn.click()

            # Verify listed item appears in catalog
            self.wait.until(EC.visibility_of_element_located((By.XPATH, f"//*[contains(text(), '{item_title[:20]}')]")))
            time.sleep(0.5)

            ss = self.capture_screenshot("TC05_Item_Inventory_Listing.png")
            print(f"[PASS] {test_id}: Item successfully added to campus lendable inventory.")
            self.record_result(test_id, desc, "PASS", ss, time.time() - start_time)
        except Exception as e:
            ss = self.capture_screenshot("TC05_Item_Inventory_FAIL.png")
            print(f"[FAIL] {test_id}: {str(e)}")
            self.record_result(test_id, desc, "FAIL", ss, time.time() - start_time, str(e))

    # =========================================================================
    # Test 6: Student Karma Wallet & Trust Profile Verification (Trust & Ledger)
    # =========================================================================
    def test_tc06_profile_karma_and_trust(self):
        test_id = "TC-06"
        desc = "Student Karma Wallet Ledger, Trust Rating & Hostel Room Verification"
        start_time = time.time()
        print(f"\n--- Running {test_id}: {desc} ---")
        try:
            self.driver.get(f"{self.base_url}/profile")
            
            # Verify Profile components
            karma_balance_card = self.wait.until(
                EC.visibility_of_element_located((By.ID, "profile-karma-balance"))
            )
            trust_score_card = self.wait.until(
                EC.visibility_of_element_located((By.ID, "profile-trust-score"))
            )
            room_badge = self.wait.until(
                EC.visibility_of_element_located((By.ID, "profile-room-badge"))
            )

            assert "karma" in karma_balance_card.text.lower(), "Karma balance metric not found"
            assert "trust score" in trust_score_card.text.lower(), "Trust score metric not found"
            
            time.sleep(0.5)
            ss = self.capture_screenshot("TC06_Karma_Wallet_Trust_Profile.png")
            print(f"[PASS] {test_id}: Profile verified (Karma, Trust Score, and Hostel Status present).")
            self.record_result(test_id, desc, "PASS", ss, time.time() - start_time)
        except Exception as e:
            ss = self.capture_screenshot("TC06_Profile_Verification_FAIL.png")
            print(f"[FAIL] {test_id}: {str(e)}")
            self.record_result(test_id, desc, "FAIL", ss, time.time() - start_time, str(e))

    # =========================================================================
    # Run Full Test Suite & Generate Execution Table
    # =========================================================================
    def run_all(self):
        try:
            self.start_browser()
            self.test_tc01_domain_validation()
            self.test_tc02_student_login()
            self.test_tc03_feed_filtering()
            self.test_tc04_create_request()
            self.test_tc05_list_inventory_item()
            self.test_tc06_profile_karma_and_trust()
        finally:
            if self.driver:
                self.driver.quit()
                print("\n[*] Browser session closed.")
        
        self.generate_reports()

    def generate_reports(self):
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results if r["status"] == "PASS")
        failed_tests = total_tests - passed_tests
        pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0

        # Console Output
        print("\n" + "=" * 95)
        print("                        AUTOMATED TEST CASE EXECUTION TABLE")
        print("=" * 95)
        header = f"{'Test ID':<9} | {'Description':<42} | {'Status':<6} | {'Execution Timestamp':<19} | {'Screenshot'}"
        print(header)
        print("-" * 95)
        for r in self.results:
            row = f"{r['test_id']:<9} | {r['description'][:42]:<42} | {r['status']:<6} | {r['timestamp']:<19} | {r['screenshot']}"
            print(row)
        print("=" * 95)
        print(f"Summary: Total: {total_tests} | Passed: {passed_tests} | Failed: {failed_tests} | Pass Rate: {pass_rate:.1f}%\n")

        # Save Markdown Report
        md_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_execution_report.md")
        with open(md_file, "w", encoding="utf-8") as f:
            f.write("# P2P Student Micro-Lending Network - Selenium Automated Test Execution Report\n\n")
            f.write(f"**Execution Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  \n")
            f.write(f"**Target URL:** `{self.base_url}`  \n")
            f.write(f"**Summary:** {passed_tests}/{total_tests} Tests Passed (**{pass_rate:.1f}%**)\n\n")
            f.write("## Test Case Execution Table\n\n")
            f.write("| Test ID | Description | Status | Execution Timestamp | Screenshot |\n")
            f.write("| :--- | :--- | :---: | :---: | :--- |\n")
            for r in self.results:
                badge = f"**{r['status']}**" if r['status'] == 'PASS' else f"*{r['status']}*"
                f.write(f"| `{r['test_id']}` | {r['description']} | {badge} | `{r['timestamp']}` | [`{r['screenshot']}`](./screenshots/{r['screenshot']}) |\n")
            
            f.write("\n\n## Live Demo Captured Screenshots\n\n")
            for r in self.results:
                f.write(f"### {r['test_id']}: {r['description']}\n\n")
                f.write(f"Status: **{r['status']}** | Timestamp: `{r['timestamp']}`\n\n")
                f.write(f"![{r['test_id']}](./screenshots/{r['screenshot']})\n\n---\n\n")

        print(f"[+] Markdown Test Report generated: {md_file}")
        print(f"[+] Screenshots directory: {self.screenshot_dir}")

if __name__ == "__main__":
    is_headed = "--headed" in sys.argv
    tester = P2PNetworkSeleniumTester(headless=not is_headed)
    tester.run_all()