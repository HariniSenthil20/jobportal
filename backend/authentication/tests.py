from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_candidate(self):
        payload = {
            'username': 'candidate1',
            'email': 'candidate1@example.com',
            'password': 'Password123!',
            'first_name': 'Jane',
            'last_name': 'Candidate',
            'role': 'candidate'
        }
        response = self.client.post('/api/auth/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='candidate1').exists())
        user = User.objects.get(username='candidate1')
        self.assertEqual(user.role, 'candidate')
        self.assertTrue(hasattr(user, 'candidate_profile'))

    def test_register_recruiter(self):
        payload = {
            'username': 'recruiter1',
            'email': 'recruiter1@example.com',
            'password': 'Password123!',
            'first_name': 'John',
            'last_name': 'Recruiter',
            'role': 'recruiter'
        }
        response = self.client.post('/api/auth/register/', payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='recruiter1')
        self.assertEqual(user.role, 'recruiter')
        self.assertTrue(hasattr(user, 'recruiter_profile'))

    def test_login_jwt(self):
        User.objects.create_user(username='testuser', password='Password123!', role='candidate')
        response = self.client.post('/api/auth/login/', {'username': 'testuser', 'password': 'Password123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
