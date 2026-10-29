import XCTest
@testable import Desys

final class DesysTests: XCTestCase {
    func testTokensMatchTheSource() {
        XCTAssertEqual(DesysSpace.md, 16)
        XCTAssertEqual(DesysRadius.control, 10)
    }

    func testEveryTabHasAnIcon() {
        XCTAssertEqual(DesysTab.allCases.count, 4)
        XCTAssertEqual(DesysIcon.allCases.count, 6)
    }
}
