import tempfile
import unittest
from pathlib import Path

from signup_service import CONSENT_VERSION, SubscriberStore, normalise_email


class SignupServiceTests(unittest.TestCase):
    def test_normalises_email(self) -> None:
        self.assertEqual(normalise_email("  Hello@Example.COM "), "hello@example.com")

    def test_rejects_invalid_email(self) -> None:
        with self.assertRaises(ValueError):
            normalise_email("not-an-email")

    def test_deduplicates_subscribers(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            store = SubscriberStore(Path(directory) / "subscribers.sqlite3")
            store.initialise()
            self.assertTrue(store.add("hello@example.com", CONSENT_VERSION))
            self.assertFalse(store.add("HELLO@example.com", CONSENT_VERSION))


if __name__ == "__main__":
    unittest.main()
