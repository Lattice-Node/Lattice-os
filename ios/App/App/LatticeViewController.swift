import UIKit
import Capacitor

/// Custom view controller that defers the bottom-edge system gesture (home indicator).
///
/// iOS normally intercepts the first tap/swipe in the bottom ~20px of the screen
/// to check for a home gesture. By overriding `preferredScreenEdgesDeferringSystemGestures`,
/// we tell iOS to require a DOUBLE swipe before activating the home gesture, letting
/// single taps pass through to the WebView's bottom tab bar — exactly like native
/// UITabBar apps (YouTube, X, PayPay, etc.).
///
/// The home indicator remains visible but becomes translucent after a few seconds.
/// The user can still go home by swiping up twice.
class LatticeViewController: CAPBridgeViewController {

    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge {
        return .bottom
    }

    override var childForScreenEdgesDeferringSystemGestures: UIViewController? {
        return nil
    }
}
