from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 
                 'phone_number', 'date_of_birth', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    is_teacher = serializers.ReadOnlyField()
    is_student = serializers.ReadOnlyField()
    is_admin = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                 'phone_number', 'date_of_birth', 'address', 'bio', 'profile_picture', 'is_active',
                 'is_teacher', 'is_student', 'is_admin',
                 'date_joined', 'created_at', 'updated_at']
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField()

    def validate(self, attrs):
        email_or_username = (attrs.get('email') or '').strip()
        username = (attrs.get('username') or '').strip()
        identifier = email_or_username or username
        password = (attrs.get('password') or '').strip()

        if identifier and password:
            if '@' in identifier:
                user = User.objects.filter(email__iexact=identifier).first()
            else:
                user = User.objects.filter(username__iexact=identifier).first()

            if not user or not user.check_password(password):
                raise serializers.ValidationError('Invalid credentials')

            # is_active is False until email is verified – let the view handle that case
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Email/username and password are required')
        
        return attrs
